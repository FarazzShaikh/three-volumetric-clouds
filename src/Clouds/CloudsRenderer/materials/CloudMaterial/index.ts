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

    uBoxMin: { value: THREE.Vector3 };
    uBoxMax: { value: THREE.Vector3 };

    uTime: { value: number };
  };

  constructor(renderer: CloudsRenderer) {
    super({
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vCameraPosition;
        varying vec3 vPosition;


        void main() {
          vUv = uv;
          vPosition = position;

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
        varying vec3 vPosition;
        
        uniform sampler2D uSceneTexture;
        uniform sampler2D uSceneDepthTexture;
        uniform sampler3D uTextureA;
        uniform sampler3D uTextureB;
        uniform sampler2D uTextureC;
        uniform sampler2D uTextureEnvelope;

        // Camera
        uniform vec2 uCameraNearFar;
        uniform vec3 uCameraPosition;
        uniform mat4 uProjectionInverse;
        uniform mat4 uCameraMatrixWorld;

        // Box
        uniform mat4 uMatrixWorldInv;
        uniform vec3 uBoxMin;
        uniform vec3 uBoxMax;

        uniform float uTime;

        float saturate(float value) {
          return clamp(value, 0.0, 1.0);
        }

        float remap(float inValue, float inOldMin, float inOldMax, float inMin, float inMax) {
          float old_min_max_range = (inOldMax - inOldMin);
          float clamped_normalized = saturate((inValue - inOldMin) / old_min_max_range);
          return inMin + (clamped_normalized*(inMax - inMin));
        }

        float remap2(float value, float valueMin, float valueMax) {
          return (value - valueMin) / (valueMax - valueMin);
        }

        float erode(float lowDetail, float highDetail, float factor) {
          float f = 1.0 - lowDetail;
          float h = factor;

          float a = highDetail * (1.0-h) + h;
          float result = saturate(remap2(a, f, f + h));

          return result;
        }


        float getDimensionalProfile(vec3 p, out float heightBlend) {
          // vec4 textureB = texture(uTextureB, vec3(p.xz, 0.2));
          // float lowWorleyFbm2 = textureB.r;
          // float lowWorleyFbm4 = textureB.g;
          // float lowWorleyFbm8 = textureB.b;

          vec4 textureEnvelope = texture(uTextureEnvelope, p.xz);
          float minHeight = textureEnvelope.r;
          float maxHeight = textureEnvelope.g;
          float cloudType = textureEnvelope.b;
          float density = textureEnvelope.a;

          
          float clampedHeight = p.y * step(minHeight, p.y) * step(p.y, maxHeight);
          float height = remap(clampedHeight, minHeight, maxHeight, 0.0, 1.0);
          height = abs(height - 0.5) * 2.0;
          height = 1.0 - height;

          float edgeGradient = length(p.xz - 0.5) * 2.0;
          edgeGradient = saturate(edgeGradient);
          edgeGradient = 1.0 - edgeGradient;
          edgeGradient = pow(edgeGradient, 1.0);

          float dimensionalProfile = height * edgeGradient;
        
          heightBlend = height;

          return dimensionalProfile;
        }
        
        float getDimensionalProfile(vec3 p) {
          float cloudType;
          return getDimensionalProfile(p, cloudType);
        }

        float getCloudDensity(vec3 p) {
          float scale = 2.0;
          vec3 coord = p * scale;
          coord.x += uTime * 0.1;
          coord = mod(coord, 1.0);

          vec4 textureA = texture(uTextureA, coord);
          // vec4 textureC = texture(uTextureC, vUv);

          float perlinWorley = textureA.r;
          float worleyFbm4 = textureA.g;
          float worleyFbm8 = textureA.b;
          float worleyFbm16 = textureA.a;

          // float curlNoise2 = textureC.r;
          // float curlNoise4 = textureC.g;
          // float curlNoise8 = textureC.b;
          
          float heightBlend = 0.0;
          float dimensionalProfile = getDimensionalProfile(p, heightBlend);

          float noiseComposite = mix(pow(1.0 - perlinWorley, 1.0), perlinWorley, heightBlend);

          float cloudDensity = saturate(perlinWorley - (1.0 - dimensionalProfile));
          // cloudDensity = mix(cloudDensity, saturate(worleyFbm16 - (1.0 - dimensionalProfile)), 0.125);
          // cloudDensity = mix(cloudDensity, saturate(worleyFbm8 - (1.0 - dimensionalProfile)), 0.25);
          // cloudDensity = mix(cloudDensity, saturate(worleyFbm4 - (1.0 - dimensionalProfile)), 0.5);


          return cloudDensity;
        }

        ${rayMarch}

        #include <alphahash_pars_fragment>

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
          vec3 aabbMin = uBoxMin;
          vec3 aabbMax = uBoxMax;

          vec3 center = vec3(0.0);
          float outerRadius = (aabbMax.x - aabbMin.x) / 2.0;
          float innerRadius = outerRadius * 0.9;

          vec2 nearFar = intersectAABB(ray, aabbMin, aabbMax);
          // vec2 nearFar = intersectAtmosphere(ray, center, innerRadius, outerRadius);
          
          // ray.origin += ray.dir * nearFar.y;
          // vec3 normalizedPos = (ray.origin - aabbMin) / (aabbMax - aabbMin);

          // March
          vec4 color = rayMarch(ray.origin, ray.dir, nearFar.x, nearFar.y, aabbMin, aabbMax);

          gl_FragColor = color;

          // hash alpha
          
        }
      `,
      uniforms: {
        uSceneTexture: { value: renderer.textureScene.texture },
        uSceneDepthTexture: { value: renderer.textureScene.depthTexture },
        uTextureA: { value: renderer.textureA3D.texture },
        uTextureB: { value: renderer.textureB3D.texture },
        uTextureC: { value: renderer.textureC2D.texture },
        uTextureEnvelope: { value: renderer.textureEnvelope.texture },

        uMatrixWorldInv: { value: new THREE.Matrix4() },
        uCameraNearFar: { value: new THREE.Vector2() },
        uCameraPosition: { value: new THREE.Vector3() },
        uProjectionInverse: { value: new THREE.Matrix4() },
        uCameraMatrixWorld: { value: new THREE.Matrix4() },

        uBoxMin: { value: new THREE.Vector3() },
        uBoxMax: { value: new THREE.Vector3() },

        uTime: { value: 0 },
      },
      transparent: true,
      alphaHash: true,
      blending: THREE.AdditiveBlending,
    });
  }

  _box: THREE.Box3 | null = null;
  update(dt: number, target: THREE.Mesh, camera: THREE.Camera) {
    this.uniforms.uTime.value += dt;
    this.uniforms.uMatrixWorldInv.value.copy(target.matrixWorld).invert();

    const c = camera as THREE.PerspectiveCamera;
    this.uniforms.uCameraNearFar.value.set(c.near, c.far);
    this.uniforms.uCameraPosition.value.copy(c.position);
    this.uniforms.uProjectionInverse.value.copy(c.projectionMatrixInverse);
    this.uniforms.uCameraMatrixWorld.value.copy(c.matrixWorld);

    if (!this._box) {
      this._box = new THREE.Box3().setFromObject(target);
    }

    this.uniforms.uBoxMin.value.copy(this._box.min);
    this.uniforms.uBoxMax.value.copy(this._box.max);
  }
}
