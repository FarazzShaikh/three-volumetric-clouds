import * as THREE from "three";
import { CloudsRenderer } from "../..";
import defines from "../shaders/defines";
import getWorldSpacePos from "../shaders/getWorldSpacePos";
import intersectAABB from "../shaders/intersectAABB";
import ray from "../shaders/ray";
import rayMarch from "../shaders/rayMarch";

export class CloudMaterial extends THREE.ShaderMaterial {
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

        ${defines}
        ${ray}
        ${intersectAABB}
        ${getWorldSpacePos}
        

        varying vec2 vUv;
        varying vec3 vCameraPosition;
        
        uniform sampler2D uSceneTexture;
        uniform sampler2D uSceneDepthTexture;
        uniform sampler3D uTextureA;
        uniform sampler3D uTextureB;
        uniform sampler2D uTextureC;

        // Camera
        uniform vec2 uCameraNearFar;
        uniform vec3 uCameraPosition;
        uniform mat4 uProjectionInverse;
        uniform mat4 uCameraMatrixWorld;

        uniform vec3 uBoxMin;
        uniform vec3 uBoxMax;

        float getSceneDist(vec3 p) {
          float distance = texture(uTextureA, p).r;
          float signedDistance = distance * 2.0 - 1.0;

          return signedDistance;
        }

        ${rayMarch}

        void main() {
          vec2 uv = vUv;

          vec4 sceneColor = texture2D(uSceneTexture, uv);
          if(sceneColor.a == 0.0) {
            discard;
            return;
          }

          // Data
          vec3 worldSpacePos = computeWorldPosition(vUv, uSceneDepthTexture, uProjectionInverse, uCameraMatrixWorld);

          // Ray
          Ray ray;
          ray.origin = uCameraPosition;
          ray.dir = normalize(worldSpacePos - uCameraPosition);

          // Box
          vec3 aabbMin = vec3(-0.5);
          vec3 aabbMax = vec3(0.5);
          vec2 nearFar = intersectAABB(ray, aabbMin, aabbMax);

          // March
          vec4 color = rayMarch(ray.origin, ray.dir, nearFar.x, nearFar.y, aabbMin, aabbMax);

          gl_FragColor = vec4(vec3(color.rgb), 1.0);
        }
      `,
      uniforms: {
        uSceneTexture: { value: renderer.textureScene.texture },
        uSceneDepthTexture: { value: renderer.textureScene.depthTexture },
        uTextureA: { value: renderer.textureA3D.texture },
        uTextureB: { value: renderer.textureB3D.texture },
        uTextureC: { value: renderer.textureC2D.texture },

        uMatrixWorldInv: { value: new THREE.Matrix4() },
        uCameraNearFar: { value: new THREE.Vector2() },
        uCameraPosition: { value: new THREE.Vector3() },
        uProjectionInverse: { value: new THREE.Matrix4() },
        uCameraMatrixWorld: { value: new THREE.Matrix4() },
      },
      transparent: true,
    });
  }

  update(target: THREE.Mesh, camera: THREE.Camera) {
    this.uniforms.uMatrixWorldInv.value.copy(target.matrixWorld).invert();

    const c = camera as THREE.PerspectiveCamera;
    this.uniforms.uCameraNearFar.value.set(c.near, c.far);
    this.uniforms.uCameraPosition.value.copy(c.position);
    this.uniforms.uProjectionInverse.value.copy(c.projectionMatrixInverse);
    this.uniforms.uCameraMatrixWorld.value.copy(c.matrixWorld);
  }
}
