import * as THREE from "three";
import fragment from "./fragment";
import vertex from "./vertex";

export class RayMarchMaterial extends THREE.ShaderMaterial {
  constructor(w: number, h: number, sdfFbo: THREE.WebGL3DRenderTarget) {
    super({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uResolution: { value: new THREE.Vector3(w, h, 0) },
        // Camera
        uCameraPosition: { value: new THREE.Vector3() },
        uCameraToWorldMatrix: { value: new THREE.Matrix4() },
        uCameraInverseProjectionMatrix: { value: new THREE.Matrix4() },

        // SDF
        uSDFTexture: { value: sdfFbo.texture },
      },
    });
  }

  set sdfTexture(value: THREE.Texture) {
    this.uniforms.uSDFTexture.value = value;
  }

  set camera(value: THREE.Camera) {
    this.uniforms.uCameraPosition.value.copy(value.position);
    this.uniforms.uCameraToWorldMatrix.value.copy(value.matrixWorld);
    this.uniforms.uCameraInverseProjectionMatrix.value.copy(
      value.projectionMatrixInverse
    );
  }
}
