export default /* glsl */ `

struct Ray {
  vec3 origin;
  vec3 dir;
};

varying Ray vRay;

uniform mat4 uMatrixWorldInverse_mesh;

void main() {
  vec3 objectSpaceCameraPosition = (uMatrixWorldInverse_mesh * vec4(cameraPosition, 1.0)).xyz;

  vRay.dir = position - objectSpaceCameraPosition;
  vRay.origin = objectSpaceCameraPosition;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
