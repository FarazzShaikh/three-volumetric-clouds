export default /* glsl */ `

// Gradient noise by iq (modified to be tileable)
float perlinNoise(vec3 x, float freq) {
    // grid
    vec3 p = floor(x);
    vec3 w = fract(x);
    
    // quintic interpolant
    vec3 u = w * w * w * (w * (w * 6. - 15.) + 10.);

    
    // gradients
    vec3 ga = hash33(mod(p + vec3(0., 0., 0.), freq));
    vec3 gb = hash33(mod(p + vec3(1., 0., 0.), freq));
    vec3 gc = hash33(mod(p + vec3(0., 1., 0.), freq));
    vec3 gd = hash33(mod(p + vec3(1., 1., 0.), freq));
    vec3 ge = hash33(mod(p + vec3(0., 0., 1.), freq));
    vec3 gf = hash33(mod(p + vec3(1., 0., 1.), freq));
    vec3 gg = hash33(mod(p + vec3(0., 1., 1.), freq));
    vec3 gh = hash33(mod(p + vec3(1., 1., 1.), freq));
    
    // projections
    float va = dot(ga, w - vec3(0., 0., 0.));
    float vb = dot(gb, w - vec3(1., 0., 0.));
    float vc = dot(gc, w - vec3(0., 1., 0.));
    float vd = dot(gd, w - vec3(1., 1., 0.));
    float ve = dot(ge, w - vec3(0., 0., 1.));
    float vf = dot(gf, w - vec3(1., 0., 1.));
    float vg = dot(gg, w - vec3(0., 1., 1.));
    float vh = dot(gh, w - vec3(1., 1., 1.));
	
    // interpolation
    return va + 
           u.x * (vb - va) + 
           u.y * (vc - va) + 
           u.z * (ve - va) + 
           u.x * u.y * (va - vb - vc + vd) + 
           u.y * u.z * (va - vc - ve + vg) + 
           u.z * u.x * (va - vb - ve + vf) + 
           u.x * u.y * u.z * (-va + vb + vc - vd + ve - vf - vg + vh);
}

float perlinFbm(vec3 p, float freq, int octaves) {
  float G = exp2(-.85);
  float amp = 1.;
  float noise = 0.;
  for (int i = 0; i < octaves; ++i)
  {
      noise += amp * perlinNoise(p * freq, freq);
      freq *= 2.;
      amp *= G;
  }
  
  float result = noise;
  result = mix(1.0, result, 0.5);

  return abs(result * 2. - 1.);
} 

float perlinFbm(vec3 p, float freq) {
  return perlinFbm(p, freq, 2);
}

// Domain warping perlin gradient noise
float curlNoise(vec3 p, float freq) {
  p *= freq;

  float curlFactor = 2.0;

  vec3 q = vec3(perlinNoise(p, freq), perlinNoise(p + vec3(5.2, 1.3, 7.1), freq), perlinNoise(p + vec3(1.7, 9.2, 3.1), freq));
  vec3 r = vec3(perlinNoise(p + q, freq), perlinNoise(p + q + vec3(5.2, 1.3, 7.1), freq), perlinNoise(p + q + vec3(1.7, 9.2, 3.1), freq));

  q = q * curlFactor;
  r = r * curlFactor;
  
  return remap(perlinNoise(p + r, freq), -1.0, 1.0, 0.0, 1.0);
}
`;
