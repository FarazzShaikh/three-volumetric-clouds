import { NoiseFunction3D } from "simplex-noise";

export function fbm(
  noise: NoiseFunction3D,
  x: number,
  y: number,
  z: number,
  octaves: number,
  lacunarity: number,
  gain: number
) {
  let sum = 0;
  let amp = 1;
  let freq = 1;

  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq, z * freq);
    amp *= gain;
    freq *= lacunarity;
  }

  return sum;
}
