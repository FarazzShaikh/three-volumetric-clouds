export default /* glsl */ `

mat3 m = mat3(0.00,  0.80,  0.60, -0.80,  0.36, -0.48, -0.60, -0.48,  0.64);

float hash( float n ) {
    return fract(sin(n)*43758.5453);
}

float noise( in vec3 x ) {
  vec3 p = floor(x);
  vec3 f = fract(x);

  f = f*f*(3.0-2.0*f);

  float n = p.x + p.y*57.0 + 113.0*p.z;

  float res = mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                      mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),
                  mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                      mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
  return res;
}

float fbm(vec3 p) {
  int octaves = 6;
  float freq = 2.0;
  float amp = 0.5;
  float value = 0.0;

  for (int i = 0; i < octaves; i++) {
    value += amp * noise(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }

  return value;

}

float sdSphere(vec3 p, float radius) {
  return length(p) - radius;
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

float getSceneDistNoTex(vec3 p) {
  float sphere = sdSphere(p, 0.5);

  float f = fbm(p);
  float s1 = sphere + f;

  float box = sdBox(p, vec3(0.5)) + f;

  return s1;
}

`;
