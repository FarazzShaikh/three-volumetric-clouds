import sdf from "./sdf";

export default /* glsl */ `
#define PI 3.14159265359
#define N_STEPS 64
#define STEP_SIZE 0.02
#define N_LIGHT_STEPS 16
#define LIGHT_STEP_SIZE 0.02

// Params
const float densityScale = 1.0;
const float transmittance = 1.0;
const float darknessThreshold = 0.025;
const float lightAbsorption = 1.0;
const float anisotropicFactor = 0.4;
const float phaseMix = 0.4;
const vec3 lightDirection = vec3(0.0, 0.0, 1.0);


// Varyings
varying vec2 vUv;

// Uniforms
uniform vec3 uResolution;
uniform vec3 uCameraPosition;
uniform mat4 uCameraToWorldMatrix;
uniform mat4 uCameraInverseProjectionMatrix;

uniform sampler3D uSDFTexture;

vec2 worldToScreen(vec3 worldPos) {
  vec4 screenPos = uCameraInverseProjectionMatrix * vec4(worldPos, 1.0);
  return screenPos.xy / screenPos.w;
}

// float sdSphere(vec3 p, float radius) {
//   return length(p) - radius;
// }

${sdf}

float getSceneDist(vec3 p) {
  // float distance = texture(uSDFTexture, p).x;
  // float signedDistance = distance * 2.0 - 1.0;

  float signedDistance = getSceneDistNoTex(p - vec3(0.5));

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

    float lightDistance = getSceneDist(lightSamplePos + vec3(0.5));
    if(lightDistance < 0.0) {
      lightDensity += -lightDistance * densityScale;
    }
  }

  // float luminance = multipleScattering(lightDensity, anisotropicFactor, cosTheta, phaseMix);
  float luminance = beersLaw(lightDensity, lightAbsorption);
  return vec3(luminance);
}

vec4 rayMarch(vec3 ro, vec3 rd, vec2 uv) {
  vec3 finalColor = vec3(0.0);
  float transmittance = 1.0;

  float depth = 0.0;
  float density = 0.0;

  float cosTheta = dot(rd, lightDirection);

  for (int i = 0; i < N_STEPS; i++) {
    depth += STEP_SIZE;
    vec3 samplePoint = ro + rd * depth;

    float minDepth = 0.0;
    float maxDepth = STEP_SIZE * float(N_STEPS);
    float normalizedDepth = depth / maxDepth;

    vec3 p = samplePoint;
    // p.z /= 2.0;

    float signedDistance = getSceneDist(p + vec3(0.5));
    // float signedDistance = getSceneDist(samplePoint);
    if (signedDistance < 0.0) {
      density += -signedDistance * densityScale;

      // vec3 luminance = marchDirectionalLight(samplePoint, lightDirection, cosTheta);
      // finalColor += luminance * density * transmittance;
      // transmittance *= beersLaw(density, lightAbsorption);

      finalColor += density;
      // break;
    }
  }

  return vec4(finalColor, 1.0 - transmittance);
}



void main() {
  vec2 uv = vUv;

  vec4 point = uCameraInverseProjectionMatrix * vec4(uv * 2.0 - 1.0, -1.0, 1.0);
  vec3 rd = (uCameraToWorldMatrix * vec4(point.xyz, 0)).xyz;
  vec3 ro = uCameraPosition;

  vec4 res = rayMarch(ro, rd, uv);

  gl_FragColor = vec4(vec3(res.rgb), 1.0);
}
`;
