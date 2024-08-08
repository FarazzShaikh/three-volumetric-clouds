import * as THREE from "three";
import fragment from "./fragment";
import vertex from "./vertex";

export class SDFPreviewMaterial extends THREE.ShaderMaterial {
  constructor(w: number, h: number, sdfFbo: THREE.WebGL3DRenderTarget) {
    super({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uResolution: { value: new THREE.Vector2(w, h) },
        uSDFTexture: { value: sdfFbo.texture },
      },
    });
  }
}
