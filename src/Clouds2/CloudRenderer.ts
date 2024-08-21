import * as THREE from "three";
import { CloudsMaterial } from "./CloudsMaterial";
import { generateSDFTexture } from "./SDFGeneraror";
import { SDFMaterial } from "./SDFMaterial";
import { SDFPreviewMaterial } from "./SDFPreviewMaterial";
import { FullScreenQuad } from "./utils/FullScreenQuad";

export class CloudRenderer {
  private _gl: THREE.WebGLRenderer;
  private _width: number;
  private _height: number;
  private _depth: number;

  private fsQuad: FullScreenQuad;

  cloudMaterial: CloudsMaterial;
  sdfMaterial: SDFMaterial;
  sdfPreviewMaterial: SDFPreviewMaterial;

  sdfTexture: THREE.Data3DTexture;

  constructor(gl: THREE.WebGLRenderer) {
    this._width = 128;
    this._height = this._width;
    this._depth = this._width;

    this._gl = gl;

    this.fsQuad = new FullScreenQuad();

    this.sdfTexture = generateSDFTexture(
      this._width,
      this._height,
      this._depth
    );

    this.sdfMaterial = new SDFMaterial(this._width, this._height);
    this.cloudMaterial = new CloudsMaterial(this.sdfTexture);
    this.sdfPreviewMaterial = new SDFPreviewMaterial(
      this._width,
      this._height,
      this.sdfTexture
    );
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
