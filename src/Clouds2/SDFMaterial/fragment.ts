import fbm from "./noise/fbm";

export default /* glsl */ `

uniform vec3 uResolution;

${fbm}

float sdCircle(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}



float mapLinear(float value, float start1, float end1, float start2, float end2) {
  return start2 + (end2 - start2) * ((value - start1) / (end1 - start1));
}

float getSceneDist(vec3 p) {
  vec3 coord = p * 0.1;
  // coord += vec3(3000., 0., 10.);

  float freq = 6.;

  float pfbm = mix(1., perlinfbm(coord, 4., 7), .5);
  pfbm = abs(pfbm * 2. - 1.); // billowy perlin noise

  vec4 col = vec4(0.);
  col.g += worleyFbm(coord, freq);
  col.b += worleyFbm(coord, freq*2.);
  col.a += worleyFbm(coord, freq*4.);
  col.r += remap(pfbm, 0., 1., col.g, 1.); // perlin-worley

  float perlinWorley = col.x;
  vec3 worley = col.yzw;
  float wfbm = worley.x * .625 +
        		 worley.y * .125 +
        		 worley.z * .25; 

  float cloud = remap(perlinWorley, wfbm - 1., 1., 0., 1.);
  cloud = remap(cloud, .5, 1., -1., 1.); // fake cloud coverage

  // Fade edges
  float mask = sdCircle(p, 0.75);
  mask = smoothstep(0.0, 1.0, mask);
  // mask = clamp(mask, -1.0, 1.0);

  float cumulusMask = 1.0 - abs(p.y);
  cumulusMask = pow(cumulusMask, 0.25);
  cumulusMask = smoothstep(0.0, 1.0, cumulusMask);

  float heightMask = clamp(p.y, -1.0, 1.0);
  heightMask = mapLinear(heightMask, -1.0, 1.0, 0.0, 1.0);
  heightMask = smoothstep(0.0, 0.5, heightMask);

  cloud = cloud * cumulusMask;
  cloud = cloud * heightMask;

  // cloud = mix(cloud, 1.0, gradY);
  // cloud = mix(cloud, 1.0, mask);

  return mapLinear(cloud, 0.0, 1.0, 1.0, -1.0);
  // return gradY;
}

float packSignedFloatToFloat(float value) {
  float clampValue = clamp(value, -1.0, 1.0);
  float zeroToOne = clampValue * 0.5 + 0.5;
  return zeroToOne;
}

void main() {
  vec3 uv = vec3(gl_FragCoord.xy / uResolution.xy, uResolution.z);
  uv -= 0.5;
  uv *= 2.0;

  float sceneDist = getSceneDist(uv);
  sceneDist = packSignedFloatToFloat(sceneDist);

  gl_FragColor = vec4(vec3(sceneDist), 1.0);
}
`;
