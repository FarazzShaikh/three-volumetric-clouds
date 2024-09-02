import * as THREE from "three";
import common from "../../shaders/common";
import perlin from "../../shaders/perlin";
import worley from "../../shaders/worley";

export class TextureA3DMaterial extends THREE.ShaderMaterial {
  declare uniforms: {
    uZCoord: { value: number };
  };

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
        uniform float uZCoord;
        uniform float uSeed;

        varying vec2 vUv;

        ${common}
        ${perlin}
        ${worley}

        void main() {
          float scale = 1.0;

          vec3 pos = vec3(vUv, uZCoord);
          pos += hash33(vec3(uSeed)) * 100.0;
          pos *= scale;

          float baseFreq = 4.0 * scale;

          float worleyFbmA = worleyFbm(pos, baseFreq);
          float worleyFbmB = worleyFbm(pos, baseFreq * 2.0);
          float worleyFbmC = worleyFbm(pos, baseFreq * 4.0);
          float perlinFbm = perlinFbm(pos, baseFreq, 7);

          float worleyPerlin = remap(perlinFbm, 0.0, 1.0, worleyFbmA, 1.0);

          gl_FragColor = vec4(worleyPerlin, worleyFbmA, worleyFbmB, worleyFbmC);
        }
      `,
      uniforms: {
        uZCoord: { value: 0 },
        // uSeed: { value: Math.random() * 1000 },
        uSeed: { value: 1 },
      },
    });
  }

  set zCoord(value: number) {
    this.uniforms.uZCoord.value = value;
  }
}
