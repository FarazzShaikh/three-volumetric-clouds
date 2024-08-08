import sdf from "./sdf";

export default /* glsl */ `

#define PI 3.14159265359
#define N_VOL_STEPS 64
#define STEP_SIZE 0.02
#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.001
#define N_LIGHT_STEPS 16
#define LIGHT_STEP_SIZE 0.02

// Params
const float densityScale = 0.4;
const float transmittance = 1.0;
const float darknessThreshold = 0.025;
const float lightAbsorption = 1.0;
const float anisotropicFactor = 0.4;
const float phaseMix = 0.4;
const vec3 lightDirection = vec3(-1.0, 0.0, 0.0);
const vec3 lightColor = vec3(1.0) * 2.0;

// Varyings
varying vec3 vPosition_WorldSpace;
varying vec3 vCameraPosition_WorldSpace;

// Uniforms
uniform sampler3D uSDFTexture;

${sdf}

float getSceneDist(vec3 p) {
  float signedDistance = 0.0;

  // signedDistance = getSceneDistNoTex(p);

  float distance = texture(uSDFTexture, ((p * 0.25) + vec3(0.5)) ).x;
  signedDistance = distance * 2.0 - 1.0;

  return signedDistance;
}


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

vec4 rayMarch(vec3 ro, vec3 rd) {
  vec3 finalColor = vec3(0.0);
  float transmittance = 1.0;

  float depth = 0.0;
  float density = 0.0;

  float cosTheta = dot(rd, lightDirection);

  vec3 samplePoint = ro + rd * depth;

  for (int i = 0; i < MAX_STEPS; i++) {
    float signedDistance = getSceneDist(samplePoint);
    depth += signedDistance;

    // Hit
    if (signedDistance < SURF_DIST || depth > MAX_DIST) {
      break;
    }

    samplePoint = ro + rd * depth;
  }

  if(depth < MAX_DIST) {
    vec3 surfaceHitPoint = samplePoint;
    float depth2 = 0.0;

    // Perform volumetric raymarching
    for (int i = 0; i < N_VOL_STEPS; i++) {
      if(depth + depth2 > MAX_DIST) break;
      
      vec3 p = surfaceHitPoint + rd * depth2;
      float signedDistance = getSceneDist(p);

      if (signedDistance < 0.0) {
        density += -signedDistance * densityScale;

        vec3 luminance = marchDirectionalLight(p, lightDirection, cosTheta);
        finalColor += lightColor * luminance * density * transmittance;
        transmittance *= beersLaw(density, lightAbsorption);
      }

      depth2 += STEP_SIZE;
    }
  }

  return vec4(finalColor, 1.0 - transmittance);
}

void main() {
  vec3 ro = vCameraPosition_WorldSpace;
  vec3 rd = normalize(vPosition_WorldSpace - vCameraPosition_WorldSpace);

  vec4 result = rayMarch(ro, rd);

  gl_FragColor = vec4(vec3(result.rgb), 1.0);
}
`;
