import * as THREE from "three";

export class TextureC2D extends THREE.WebGLRenderTarget {
  name: string;

  constructor(width: number, height: number) {
    super(width, height, {
      depthBuffer: false,
      stencilBuffer: false,
    });

    this.name = "TextureC3D";

    this.texture.type = THREE.UnsignedByteType;
    this.texture.format = THREE.RGBAFormat;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.generateMipmaps = false;
  }
}
