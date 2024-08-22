export default /* glsl */ `

uniform vec2 uResolution;
uniform sampler3D uSDFTexture;

varying vec2 vUv;

float mapLinear(float value, float start1, float end1, float start2, float end2) {
  return start2 + (end2 - start2) * ((value - start1) / (end1 - start1));
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  uv.x *= aspect;

  vec3 coord = vec3(uv, 0.5);

  float r = 1.0 - texture(uSDFTexture, coord).r;
  // r = mapLinear(r, 0.0, 1.0, 1.0, 1.0);

  gl_FragColor = vec4(vec3(r), 1.0);
}
`;
