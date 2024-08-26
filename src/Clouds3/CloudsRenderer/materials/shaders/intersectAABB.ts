export default /* glsl */ `

vec2 intersectTransformedAABB(Ray ray, mat4 invMatrix, vec3 boxMin, vec3 boxMax) {
  vec3 rayOrigin = (invMatrix * vec4(ray.origin, 1.0)).xyz;
  vec3 rayDir = (invMatrix * vec4(ray.dir, 0.0)).xyz;

  vec3 tMin = (boxMin - rayOrigin) / rayDir;
  vec3 tMax = (boxMax - rayOrigin) / rayDir;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);

  return vec2(tNear, tFar);
}

vec2 intersectAABB(Ray ray, vec3 boxMin, vec3 boxMax) {
  vec3 rayOrigin = ray.origin;
  vec3 rayDir = ray.dir;

  vec3 tMin = (boxMin - rayOrigin) / rayDir;
  vec3 tMax = (boxMax - rayOrigin) / rayDir;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);

  return vec2(tNear, tFar);
}

`;
