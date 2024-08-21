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
varying vec3 vOrigin;
varying vec3 vDirection;

// Uniforms
uniform sampler3D uSDFTexture;

${sdf}

float getSceneDist(vec3 p) {
  float signedDistance = 0.0;
  vec3 coord = p;

  // if(coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0 || coord.z < 0.0 || coord.z > 1.0) {
  //   return 1.0;
  // }

  // signedDistance = getSceneDistNoTex(p);

  float distance = texture(uSDFTexture, coord).x;
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

vec2 intersectAABB(vec3 rayOrigin, vec3 rayDir, vec3 boxMin, vec3 boxMax) {
  vec3 tMin = (boxMin - rayOrigin) / rayDir;
  vec3 tMax = (boxMax - rayOrigin) / rayDir;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);

  return vec2(tNear, tFar);
}

vec4 compose(vec4 color, vec3 entryPoint, vec3 rayDir, float samples, float tStart, float tEnd, float tIncr) {
  // Composition of samples using maximum intensity projection.
  // Loop through all samples along the ray.
  float density = 0.0;
  vec4 c = vec4(0.0);
  for (float i = 0.0; i < samples; i += 1.0) {
    // Determine the sampling position.
    float t = tStart + tIncr * i; // Current distance along ray.
    vec3 p = entryPoint + rayDir * t; // Current position.

    // Sample the volume data at the current position. 
    float value = texture(uSDFTexture, p).r;      

    // Keep track of the maximum value.
    if (value > density) {
      // Store the value if it is greater than the previous values.
      density = value;
    }

    // Early exit the loop when the maximum possible value is found or the exit point is reached. 
    if (density >= 1.0 || t > tEnd) {
      break;
    }
  }

  // Convert the found value to a color by sampling the color palette texture.
  c.rgb = vec3(density);
  // Modify the alpha value of the color to make lower values more transparent.
  // color.a = alphaScale * (invertColor ? 1.0 - density : density);
  c.a = 1.0;

  // Return the color for the ray.
  return c;
}

void main() {
  vec3 rayDir = normalize(vDirection);
  vec3 aabbmin = vec3(-0.5);
  vec3 aabbmax = vec3(0.5);
  vec2 intersection = intersectAABB(vOrigin, rayDir, aabbmin, aabbmax);

  // Initialize the fragment color.
  vec4 color = vec4(0.0);

  float samplingRate = 1.0;
  float threshold = 0.001;
  float alphaScale = 1.0;
  bool invertColor = false;

  if (intersection.x <= intersection.y) {
    // Clamp the near intersection distance when the camera is inside the box so we do not start sampling behind the camera.
    intersection.x = max(intersection.x, 0.0);
    // Compute the entry and exit points for the ray.
    vec3 entryPoint = vOrigin + rayDir * intersection.x;
    vec3 exitPoint = vOrigin + rayDir * intersection.y;

    // Determine the sampling rate and step size.
    // Entry Exit Align Corner sampling as described in
    // Volume Raycasting Sampling Revisited by Steneteg et al. 2019
    vec3 dimensions = vec3(textureSize(uSDFTexture, 0));
    vec3 entryToExit = exitPoint - entryPoint;
    float samples = ceil(samplingRate * length(entryToExit * (dimensions - vec3(1.0))));
    float tEnd = length(entryToExit);
    float tIncr = tEnd / samples;
    float tStart = 0.5 * tIncr;

    // Determine the entry point in texture space to simplify texture sampling.
    vec3 texEntry = (entryPoint - aabbmin) / (aabbmax - aabbmin);

    // Sample the volume along the ray and convert samples to color.
    color = compose(color, texEntry, rayDir, samples, tStart, tEnd, tIncr);
  }

  gl_FragColor = vec4(color.rgb, 1.0);
}
`;
