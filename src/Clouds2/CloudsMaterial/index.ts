import * as THREE from "three";
import fragment from "./fragment";
import vertex from "./vertex";

export class CloudsMaterial extends THREE.ShaderMaterial {
  declare uniforms: {
    uMatrixWorldInverse_mesh: { value: THREE.Matrix4 };
    uSDFTexture: { value: THREE.Texture };
    uBoxMin: { value: THREE.Vector3 };
    uBoxMax: { value: THREE.Vector3 };
  };

  private box: THREE.Box3 | null = null;

  constructor(sdfTexture: THREE.Data3DTexture) {
    super({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uMatrixWorldInverse_mesh: { value: new THREE.Matrix4() },
        uSDFTexture: { value: sdfTexture },
        uBoxMin: { value: new THREE.Vector3() },
        uBoxMax: { value: new THREE.Vector3() },
      },
      side: THREE.BackSide,
      transparent: true,
      // glslVersion: THREE.GLSL3,
    });
  }

  update(parentMesh: THREE.Mesh) {
    this.uniforms.uMatrixWorldInverse_mesh.value
      .copy(parentMesh.matrix)
      .invert();

    if (!this.box) {
      this.box = new THREE.Box3();
      this.box.setFromObject(parentMesh);
      this.uniforms.uBoxMin.value.copy(this.box.min);
      this.uniforms.uBoxMax.value.copy(this.box.max);
    }
  }
}
