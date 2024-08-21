import { createNoise3D } from "simplex-noise";
import * as THREE from "three";
import { fbm } from "./fbm";

function sdfSphere(p: THREE.Vector3, radius: number) {
  return p.length() - radius;
}

export function generateSDFTexture(
  width: number,
  height: number,
  depth: number
) {
  const voxelPerSlice = width * height;
  const voxelCount = voxelPerSlice * depth;

  const buffer = new Uint8Array(voxelCount);
  const noise = createNoise3D(Math.random);

  const scale = 0.02;
  const pos = new THREE.Vector3();

  for (let i = 0; i < voxelCount; ++i) {
    const x = i % width;
    const y = Math.floor((i % voxelPerSlice) / width);
    const z = Math.floor(i / voxelPerSlice);

    const normalizedX = x / width;
    const normalizedY = y / height;
    const normalizedZ = z / depth;

    const centeredX = normalizedX - 0.5;
    const centeredY = normalizedY - 0.5;
    const centeredZ = normalizedZ - 0.5;

    pos.set(centeredX, centeredY, centeredZ);
    let sphere = sdfSphere(pos, 0.5);
    // sphere = THREE.MathUtils.smoothstep(0.0, 1.0, sphere);

    let p = fbm(noise, x * scale, y * scale, z * scale, 6, 2, 0.5);

    let value = Math.max(sphere, p);
    value = THREE.MathUtils.clamp(value, -1, 1);
    value = THREE.MathUtils.mapLinear(value, -1, 1, 0, 1);

    buffer[i] = Math.round(value * 255);
  }

  const texture = new THREE.Data3DTexture(buffer, width, height, depth);
  texture.format = THREE.RedFormat;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.type = THREE.UnsignedByteType;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  texture.unpackAlignment = 1;

  return texture;
}
