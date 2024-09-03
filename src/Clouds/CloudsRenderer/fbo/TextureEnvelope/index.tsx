import * as THREE from "three";

export class TextureEnvelope extends THREE.WebGLRenderTarget {
  name: string;
  labels: string[];
  default: number;

  constructor(width: number, height: number) {
    super(width, height, {
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

    this.name = "TextureEnvelope";
    this.labels = ["Min Height", "Max Height", "Cloud Type", "Cloud Density"];
    this.default = 1;
  }
}
