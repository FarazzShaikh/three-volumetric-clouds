import * as THREE from "three";
import common from "../../shaders/common";
import worley from "../../shaders/worley";

export class TextureB3DMaterial extends THREE.ShaderMaterial {
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
        ${worley}

        void main() {
          vec3 pos = vec3(vUv, uZCoord);
          pos += hash33(vec3(uSeed)) * 100.0;

          float baseFreq = 2.0;

          float worleyFbmA = worleyFbm(pos, baseFreq);
          float worleyFbmB = worleyFbm(pos, baseFreq * 2.0);
          float worleyFbmC = worleyFbm(pos, baseFreq * 4.0);

          gl_FragColor = vec4(worleyFbmA, worleyFbmB, worleyFbmC, 1.0);
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
