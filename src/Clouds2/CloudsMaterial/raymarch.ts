export default /* glsl */ `


float beersLaw(float density, float absorptionCoefficient) {
  return exp(-absorptionCoefficient * density);
}

float henyeyGreenstein(float g, float cosTheta) {
  float g2 = g * g;
  return 1.0 / (4.0 * PI * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
}

float dualLobeHenyeyGreenstein(float g, float cosTheta, float K) {
  return mix(
    henyeyGreenstein(g, cosTheta),
    henyeyGreenstein(-g, cosTheta),
    K
  );
}

float multipleScattering(float depth, float g, float cosTheta, float K) {
  int octaves = 4;
  float attenuation = 0.5;
  float contribution = 0.5;
  float phaseAttenuation = 0.1;

  float luminance = 0.0;

  float a = 1.0;
  float b = 1.0;
  float c = 1.0;

  for (int i = 0; i < octaves; i++) {
    float beer = beersLaw(depth, a);
    float phase = dualLobeHenyeyGreenstein(g * c, cosTheta, K);

    luminance += b * phase * beer;
    a *= attenuation;
    b *= contribution;
    c *= (1.0 - phaseAttenuation);
  }

  return luminance;
}

// Volumetric raymarching 
vec3 marchDirectionalLight(vec3 samplePos, vec3 lightDirection, float cosTheta) {
  float lightDepth = 0.0;
  float lightDensity = 0.0;

  for (int j = 0; j < N_LIGHT_STEPS; j++) {
    lightDepth += LIGHT_STEP_SIZE;
    vec3 lightSamplePos = samplePos - lightDirection * lightDepth;

    float lightDistance = getSceneDist(lightSamplePos);
    if(lightDistance < 0.0) {
      lightDensity += -lightDistance * densityScale;
    }
  }

  float luminance = multipleScattering(lightDensity, anisotropicFactor, cosTheta, phaseMix);
  // float luminance = beersLaw(lightDensity, lightAbsorption);
  return vec3(luminance);
}

vec4 rayMarch(vec3 ro, vec3 rd, float near, float far, vec3 aabbMin, vec3 aabbMax) {
  vec3 finalColor = vec3(0.0);
  float transmittance = 1.0;

  float depth = 0.0;
  float density = 0.0;

  vec3 lightPos = lightPosition;
  vec3 lightDirection = -normalize(lightPos - ro);

  float cosTheta = dot(rd, lightDirection);

  float stepSize = (far - near) / float(MAX_STEPS);

  vec3 samplePoint = ro + rd * near;
  samplePoint = (samplePoint - aabbMin) / (aabbMax - aabbMin);

  for (int i = 0; i < MAX_STEPS; i++) {
    if(depth > far) break;

    samplePoint += rd * stepSize;

    float signedDistance = getSceneDist(samplePoint);

    if(signedDistance < 0.0) {
      density += -signedDistance * densityScale;

      vec3 luminance = marchDirectionalLight(samplePoint, lightDirection, cosTheta);
      finalColor += lightColor * luminance * density * transmittance;
      transmittance *= beersLaw(density, lightAbsorption);

      // Ambient light
      vec3 ambientLight = ambientLightColor;
      finalColor += ambientLight * density * transmittance;

    }

    depth += stepSize;
  }

  // finalColor.rgb = vec3(density);

  return vec4(finalColor, 1.0 - transmittance);
}
`;
