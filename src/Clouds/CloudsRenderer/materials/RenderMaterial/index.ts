import * as THREE from "three";
import { CloudsRenderer } from "../..";

export class RenderMaterial extends THREE.ShaderMaterial {
  declare uniforms: {
    uMatrixWorldInv: { value: THREE.Matrix };
    uCameraNearFar: { value: THREE.Vector2 };
    uCameraPosition: { value: THREE.Vector3 };
    uProjectionInverse: { value: THREE.Matrix4 };
    uCameraMatrixWorld: { value: THREE.Matrix4 };
  };

  constructor(renderer: CloudsRenderer) {
    super({
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vCameraPosition;

        uniform mat4 uMatrixWorldInv;

        void main() {
          vUv = uv;

          vCameraPosition = cameraPosition;

          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp sampler3D;

        varying vec2 vUv;
        
        uniform sampler2D uSceneTexture;
        uniform sampler2D uSceneDepthTexture;
        uniform sampler2D uCloudTexture;

        void main() {
          vec2 uv = vUv;

          vec4 sceneColor = texture2D(uSceneTexture, uv);
          vec4 cloudColor = texture2D(uCloudTexture, uv);

          if(sceneColor.a <= 0.0) {
            discard;
            return;
          } else {
            gl_FragColor = cloudColor;
          }
        }
      `,
      uniforms: {
        uSceneTexture: { value: renderer.textureScene.texture },
        uSceneDepthTexture: { value: renderer.textureScene.depthTexture },
        uCloudTexture: { value: renderer.textureCloud.texture },
      },
      transparent: true,
    });
  }
}
