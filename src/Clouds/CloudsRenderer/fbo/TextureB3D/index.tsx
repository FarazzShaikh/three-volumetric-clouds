import * as THREE from "three";

export class TextureB3D extends THREE.WebGL3DRenderTarget {
  name: string;

  constructor(width: number, height: number, depth: number) {
    super(width, height, depth, {
      depthBuffer: false,
      stencilBuffer: false,
    });

    this.name = "TextureB3D";

    this.texture.type = THREE.UnsignedByteType;
    this.texture.format = THREE.RGBAFormat;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;
  }
}
