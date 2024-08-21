import * as THREE from "three";
import fragment from "./fragment";
import vertex from "./vertex";

export class SDFPreviewMaterial extends THREE.ShaderMaterial {
  constructor(w: number, h: number, sdfTexture: THREE.Data3DTexture) {
    super({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uResolution: { value: new THREE.Vector2(w, h) },
        uSDFTexture: { value: sdfTexture },
      },
    });
  }
}
