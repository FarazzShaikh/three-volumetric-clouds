import * as THREE from "three";

export function createRenderTarget(
  width: number,
  height: number,
  opts: THREE.RenderTargetOptions = {}
) {
  return new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    ...opts,
  });
}

export function createRenderTarget3D(
  width: number,
  height: number,
  depth: number,
  opts: THREE.RenderTargetOptions = {}
) {
  return new THREE.WebGL3DRenderTarget(width, height, depth, {
    depthBuffer: false,
    stencilBuffer: false,
    ...opts,
  });
}
