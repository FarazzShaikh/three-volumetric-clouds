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

    float _lightDensity = getCloudDensity(lightSamplePos);
    _lightDensity = clamp(_lightDensity, 0.0, 1.0);
    lightDensity += _lightDensity * densityScale;

    if(lightDensity >= 1.0) break;
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
  int steps = MAX_STEPS;

  vec3 samplePoint = ro + rd * near;
  samplePoint = (samplePoint - aabbMin) / (aabbMax - aabbMin);

  bool hasHit = false;
  float adaptiveStepSize = stepSize;
  
  for (int i = 0; i < steps; i++) {
    // if(depth > far) break;

    samplePoint += rd * adaptiveStepSize;
    // samplePoint = mod(samplePoint, 1.0);

    if(samplePoint.x < 0.0 || samplePoint.x > 1.0 || samplePoint.y < 0.0 || samplePoint.y > 1.0 || samplePoint.z < 0.0 || samplePoint.z > 1.0) {
      break;
    }

    float _density;
    if(hasHit) {
      _density = getCloudDensity(samplePoint);
    } else {
      _density = getCloudDensity(samplePoint);
    }

    _density = clamp(_density, 0.0, 1.0);
    density += _density * densityScale;

    if(_density > 0.0) {
      if(!hasHit) {
        hasHit = true;
        depth -= adaptiveStepSize;
        samplePoint -= rd * adaptiveStepSize;
        adaptiveStepSize *= 0.5;
        steps = int(1.0 / adaptiveStepSize);
        continue;
      }

      vec3 luminance = marchDirectionalLight(samplePoint, lightDirection, cosTheta);
      finalColor += lightColor * luminance * density * transmittance;
      transmittance *= beersLaw(density, lightAbsorption);

      // finalColor += vec3(density);

      // Ambient light
      vec3 ambientLight = ambientLightColor;
      finalColor += ambientLight * density * transmittance;
    } else {
      if(hasHit) {
        hasHit = false;
        adaptiveStepSize = stepSize;
        steps = MAX_STEPS;
      }
    }

    if(density >= 1.0) break;

    depth += adaptiveStepSize;
  }

  // finalColor.rgb = vec3(density);

  return vec4(finalColor, 1.0 - transmittance);
}
`;
