import raymarch from "./raymarch";

export default /* glsl */ `

#define PI 3.14159265359
#define N_VOL_STEPS 64
#define STEP_SIZE 0.02
#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.001
#define N_LIGHT_STEPS 16
#define LIGHT_STEP_SIZE 0.02

#define NB_STEPS 100

// Params
const float densityScale = 0.4;
const float transmittance = 1.0;
const float darknessThreshold = 0.025;
const float lightAbsorption = 1.0;
const float anisotropicFactor = 0.4;
const float phaseMix = 0.4;
const vec3 lightPosition = vec3(-10.0, 10.0, -10.0);
const vec3 lightColor = vec3(1.0) * 2.0;
const vec3 ambientLightColor = vec3(1.0) * 0.5;

struct Ray {
  vec3 origin;
  vec3 dir;
};


// Varyings
varying Ray vRay;

// Uniforms
precision highp sampler3D;
uniform sampler3D uSDFTexture;

uniform vec3 uBoxMin;
uniform vec3 uBoxMax;

float getSceneDist(vec3 p) {
  float distance = texture(uSDFTexture, p).r;
  float signedDistance = distance * 2.0 - 1.0;

  return signedDistance;
}

${raymarch}

vec2 intersectAABB(vec3 rayOrigin, vec3 rayDir, vec3 boxMin, vec3 boxMax) {
  vec3 tMin = (boxMin - rayOrigin) / rayDir;
  vec3 tMax = (boxMax - rayOrigin) / rayDir;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);

  return vec2(tNear, tFar);
}

float getSample(float x, float y, float z) {
  return texture(uSDFTexture, vec3(x, y, z)).r;
}

vec3 computeGradient(vec3 position, float step) {
  return normalize(vec3(
    getSample(position.x + step, position.y, position.z)
    - getSample(position.x - step, position.y, position.z),
    getSample(position.x, position.y + step, position.z)
    - getSample(position.x, position.y - step, position.z),
    getSample(position.x, position.y, position.z + step)
    - getSample(position.x, position.y, position.z - step)
  ));
}

void main() {
  Ray ray;
  ray.origin = vRay.origin;
  ray.dir = normalize(vRay.dir);

  // Solves a ray - Unit Box equation to determine the value of the closest and
  // furthest intersections.
  vec3 aabbMin = uBoxMin;
  vec3 aabbMax = uBoxMax;
  vec2 nearFar = intersectAABB(ray.origin, ray.dir, aabbMin, aabbMax);
  float near = nearFar.x;
  float far = nearFar.y;

  // Moves the ray origin to the closest intersection.
  // We don't want to spend time sampling nothing out of the volume!
  // ray.origin = ray.origin + near * ray.dir;
  // Normalizes the ray origin to the unit box.
  // ray.origin = (ray.origin - aabbMin) / (aabbMax - aabbMin);

  // vec3 inc = 1.0 / abs( ray.dir );
  // float delta = min(inc.x, min(inc.y, inc.z)) / float(NB_STEPS);
  // ray.dir = ray.dir * delta;


  // Hardcoded for now: diffuse color of our cloud.
  // vec3 baseColor = vec3(0.5);

  // // Accumulation through the volume is stored in this variable.
  // vec4 acc = vec4(0.0);
  // float depth = near;

  // vec3 lightDir = vec3(0., -1., 0.);

  vec4 color = rayMarch(ray.origin, ray.dir, near, far, aabbMin, aabbMax);

  gl_FragColor = vec4(color.rgb, color.a);
}
`;

// i = 0; i < NB_STEPS; ++i)
// {
//   // Get the voxel at the current ray position
//   float s = texture(uSDFTexture, ray.origin).r;
//   // Remap s from [0, 1] to [-1, 1]
//   // s = s * 2.0 - 1.0;

//   // vec3 gradient = computeGradient(ray.origin, delta);
//   // float NdotL = max(0., dot(gradient, lightDir));

//   // // The more we already accumulated, the less color we apply.
//   // acc.rgb += (1.0 - acc.a) * s * baseColor * NdotL;
//   // // The more we already accumulated, the less opacity we apply.
//   // acc.a += (1.0 - acc.a) * s * 0.5;

//   // // Early termination: after this threshold,
//   // // accumulating becomes insignificant.
//   // if (acc.a > 0.95) { break; }

//   ray.origin += ray.dir;
//   depth += delta;

//   if(depth > far) {
//     break;
//   }

//   if(s > 0.5) {
//     acc.rgb = vec3(1.0) * s;
//     break;
//   }
// }
