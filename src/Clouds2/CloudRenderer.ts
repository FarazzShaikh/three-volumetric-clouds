import * as THREE from "three";
import { CloudsMaterial } from "./CloudsMaterial";
import { SDFMaterial } from "./SDFMaterial";
import { SDFPreviewMaterial } from "./SDFPreviewMaterial";
import { FullScreenQuad } from "./utils/FullScreenQuad";
import { createRenderTarget3D } from "./utils/funcs";

export class CloudRenderer {
  private _gl: THREE.WebGLRenderer;
  private _width: number;
  private _height: number;
  private _depth: number;

  private fsQuad: FullScreenQuad;

  cloudMaterial: CloudsMaterial;
  sdfMaterial: SDFMaterial;
  sdfPreviewMaterial: SDFPreviewMaterial;

  sdfFbo: THREE.WebGL3DRenderTarget;

  constructor(gl: THREE.WebGLRenderer) {
    this._width = 512;
    this._height = this._width;
    this._depth = this._width;

    this._gl = gl;

    this.fsQuad = new FullScreenQuad();

    this.sdfFbo = createRenderTarget3D(this._width, this._height, this._depth);

    this.sdfMaterial = new SDFMaterial(this._width, this._height);
    this.cloudMaterial = new CloudsMaterial(this.sdfFbo);
    this.sdfPreviewMaterial = new SDFPreviewMaterial(
      this._width,
      this._height,
      this.sdfFbo
    );

    this.generateSdf();
  }

  generateSdf() {
    for (let i = 0; i < this._depth; i++) {
      const normalizedDepth = i / this._depth;
      const depthMinusOneToOne = normalizedDepth * 2 - 1;
      this.sdfMaterial.zCoord = depthMinusOneToOne * 0.5;

      this._gl.setRenderTarget(this.sdfFbo, i);
      this.fsQuad.material = this.sdfMaterial;
      this.fsQuad.render(this._gl);
    }

    this._gl.setRenderTarget(null);
  }

  update(parent: THREE.Mesh) {
    this.cloudMaterial.update(parent);

    this.fsQuad.material = this.sdfPreviewMaterial;
    this.fsQuad.render(this._gl);
  }

  get material() {
    return this.cloudMaterial;
  }
}
