import * as THREE from "three";
import fragment from "./fragment";
import vertex from "./vertex";

export class CloudsMaterial extends THREE.ShaderMaterial {
  declare uniforms: {
    uMatrixWorldInverse_mesh: { value: THREE.Matrix4 };
    uSDFTexture: { value: THREE.Texture };
  };

  constructor(sdfFbo: THREE.WebGL3DRenderTarget) {
    super({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uMatrixWorldInverse_mesh: { value: new THREE.Matrix4() },
        uSDFTexture: { value: sdfFbo.texture },
        uSDFTextureSize: {
          value: new THREE.Vector2(sdfFbo.width, sdfFbo.height),
        },
      },
      side: THREE.BackSide,
    });
  }

  update(parentMesh: THREE.Mesh) {
    this.uniforms.uMatrixWorldInverse_mesh.value
      .copy(parentMesh.matrix)
      .invert();
  }
}
