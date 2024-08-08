import * as THREE from "three";
import fragment from "./fragment";
import vertex from "./vertex";

export class OutputMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: vertex,
      fragmentShader: fragment,
    });
  }
}
