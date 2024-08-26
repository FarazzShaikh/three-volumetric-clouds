import * as THREE from "three";

export class TextureCloud extends THREE.WebGLRenderTarget {
  name: string;

  constructor(width: number, height: number) {
    super(width, height, {
      stencilBuffer: false,
      depthBuffer: false,
    });

    this.name = "TextureCloud";
  }
}
