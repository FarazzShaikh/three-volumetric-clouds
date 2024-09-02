import * as THREE from "three";
import common from "../../shaders/common";
import perlin from "../../shaders/perlin";

export class TextureEnvelopeMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: /* glsl */ `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uSeed;
        varying vec2 vUv;

        ${common}
        ${perlin}

        float hash(float n) {
          return fract(sin(n) * 43758.5453);
        }

        float normalizedSdCircle(vec2 uv, vec2 center, float radius) {
          return clamp(1.0 - (length(uv - center) / radius), 0.0, 1.0);
        }

        float saturate(float value) {
          return clamp(value, 0.0, 1.0);
        }

        void main() {
          vec2 uv = vUv;

          // Min height
          float minHeight = 0.25;

          // Max height
          float scaleA = 2.0;
          float seedA = hash(2.0);
          float perlinA = perlinNoise(vec3((uv + (seedA * 1000.0)) * scaleA, 0.0), scaleA);
          perlinA = remap(perlinA, -1.0, 1.0, 0.0, 1.0);
          float maxHeight = perlinA;

          // Type
          float stratus = uv.y;
          stratus = saturate(1.0 - abs(stratus - 0.95) * 2.0);
          stratus = smoothstep(0.9, 1.0, stratus);
          
          float cumulus = uv.y;
          cumulus = saturate(1.0 - abs(cumulus - 0.7) * 2.0);
          cumulus = smoothstep(0.3, 0.7, cumulus);

          float cumulonimbus = uv.y;
          cumulonimbus = saturate(1.0 - abs(cumulonimbus - 0.55) * 2.0);
          cumulonimbus = smoothstep(0.0, 0.3, cumulonimbus);

          // Blend the types across uv.x
          float type = mix(stratus, cumulus, smoothstep(0.0, 0.5, uv.x));
          type = mix(type, cumulonimbus, smoothstep(0.5, 1.0, uv.x));

          // Out
          gl_FragColor = vec4(minHeight, maxHeight, type, 0.0);
        }
      `,
      uniforms: {
        // uSeed: { value: Math.random() * 1000 },
        uSeed: { value: 1 },
      },
    });
  }
}
