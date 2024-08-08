import * as THREE from "three";
import fragment from "./fragment";
import vertex from "./vertex";

export class SDFMaterial extends THREE.ShaderMaterial {
  constructor(w: number, h: number) {
    super({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uResolution: { value: new THREE.Vector3(w, h, 0) },
      },
    });
  }

  set zCoord(value: number) {
    this.uniforms.uResolution.value.z = value;
  }
}
