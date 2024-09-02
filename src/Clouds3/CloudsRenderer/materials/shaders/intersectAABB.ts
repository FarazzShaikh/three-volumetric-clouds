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


vec2 intersectSphere(Ray ray, vec3 sphereCenter, float sphereRadius) {
  vec3 oc = ray.origin - sphereCenter;
  float a = dot(ray.dir, ray.dir);
  float b = 2.0 * dot(oc, ray.dir);
  float c = dot(oc, oc) - sphereRadius * sphereRadius;
  float discriminant = b * b - 4.0 * a * c;

  if(discriminant < 0.0) {
    return vec2(-1.0, -1.0);
  }

  float t1 = (-b - sqrt(discriminant)) / (2.0 * a);
  float t2 = (-b + sqrt(discriminant)) / (2.0 * a);
 
  return vec2(t1, t2);
}


vec2 intersectAtmosphere(Ray ray, vec3 center, float planetRadius, float atmosphereRadius) {
  vec2 inner = intersectSphere(ray, center, planetRadius);
  vec2 outer = intersectSphere(ray, center, atmosphereRadius);

  bool isInsideAtmosphere = outer.x < 0.0;

  if(isInsideAtmosphere) {
    if(inner.x < 0.0 && inner.y < 0.0) {
      return vec2(0.0, outer.y);
    } else {
      return vec2(0.0, inner.x);
    }
  } else {
    if(inner.x < 0.0) {
      return outer;
    } else {
      return vec2(outer.x, inner.x);
    }
  }
}

`;
