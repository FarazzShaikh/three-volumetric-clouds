export default /* glsl */ `

uniform vec2 uResolution;
uniform sampler3D uSDFTexture;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  vec3 coord = vec3(uv, 0.0);

  float r = texture(uSDFTexture, coord).r;

  gl_FragColor = vec4(vec3(r), 1.0);
}
`;
