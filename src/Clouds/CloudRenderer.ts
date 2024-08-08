import * as THREE from "three";
import { RayMarchMaterial } from "./materials/RayMarchMaterial";
import { SDFMaterial } from "./materials/SDFMaterial";
import { Size } from "./types";
import { FullScreenQuad } from "./utils/FullScreenQuad";
import { createRenderTarget3D } from "./utils/funcs";

export class CloudRenderer {
  private _gl: THREE.WebGLRenderer;
  private _width: number;
  private _height: number;
  private _ratio: number;

  private fsQuad: FullScreenQuad;

  rayMarchMaterial: RayMarchMaterial;
  sdfMaterial: SDFMaterial;

  sdfFbo: THREE.WebGL3DRenderTarget;
  sdfFboDepth: number;

  constructor(gl: THREE.WebGLRenderer, size: Size) {
    this._ratio = 1;
    this.sdfFboDepth = 512;

    this._gl = gl;
    this._width = size.width * this._ratio;
    this._height = size.height * this._ratio;

    this.fsQuad = new FullScreenQuad();

    this.sdfFbo = createRenderTarget3D(
      this.sdfFboDepth,
      this.sdfFboDepth,
      this.sdfFboDepth
    );

    this.rayMarchMaterial = new RayMarchMaterial(
      this._width,
      this._height,
      this.sdfFbo
    );
    this.sdfMaterial = new SDFMaterial(this.sdfFboDepth, this.sdfFboDepth);
  }

  generateSdf() {
    for (let i = 0; i < this.sdfFboDepth; i++) {
      const normalizedDepth = i / this.sdfFboDepth;
      const depthMinusOneToOne = normalizedDepth * 2 - 1;
      this.sdfMaterial.zCoord = depthMinusOneToOne * 0.5;

      this._gl.setRenderTarget(this.sdfFbo, i);
      this.fsQuad.material = this.sdfMaterial;
      this.fsQuad.render(this._gl);
    }

    this._gl.setRenderTarget(null);
  }

  init() {
    this.generateSdf();
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.rayMarchMaterial.camera = camera;
    this.fsQuad.material = this.rayMarchMaterial;
    this.fsQuad.render(this._gl);
  }
}
