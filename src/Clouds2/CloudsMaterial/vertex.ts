export default /* glsl */ `

varying vec3 vPosition_WorldSpace;
varying vec3 vCameraPosition_WorldSpace;

uniform mat4 uMatrixWorldInverse_mesh;

void main() {
  vPosition_WorldSpace = (modelMatrix * vec4(position, 1.0)).xyz;
  vCameraPosition_WorldSpace = cameraPosition;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
