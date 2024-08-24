import * as THREE from "three";
import { TextureA3D } from "./fbo/TextureA3D";
import { TextureA3DMaterial } from "./fbo/TextureA3D/TextureA3DMaterial";
import { TextureB3D } from "./fbo/TextureB3D";
import { TextureB3DMaterial } from "./fbo/TextureB3D/TextureB3DMaterial";
import { TextureC2D } from "./fbo/TextureC3D";
import { TextureC2DMaterial } from "./fbo/TextureC3D/TextureB3DMaterial";
import { TextureScene } from "./fbo/TextureScene";
import { FullScreenQuad } from "./FullScreenQuad";
import { RenderMaterial } from "./materials/RenderMaterial";

export class CloudsRenderer {
  _gl: THREE.WebGLRenderer;

  textureA3DMaterial: TextureA3DMaterial;
  textureA3D: TextureA3D;

  textureB3DMaterial: TextureB3DMaterial;
  textureB3D: TextureB3D;

  textureC2DMaterial: TextureC2DMaterial;
  textureC2D: TextureC2D;

  textureScene: TextureScene;

  renderMaterial: RenderMaterial;

  fsQuad: FullScreenQuad;

  constructor(gl: THREE.WebGLRenderer) {
    this._gl = gl;

    this.textureA3D = new TextureA3D(128, 128, 128);
    this.textureB3D = new TextureB3D(32, 32, 32);
    this.textureC2D = new TextureC2D(128, 128);
    this.textureScene = new TextureScene(512, 512);

    this.fsQuad = new FullScreenQuad();

    this.textureA3DMaterial = new TextureA3DMaterial();
    this.textureB3DMaterial = new TextureB3DMaterial();
    this.textureC2DMaterial = new TextureC2DMaterial();
    this.renderMaterial = new RenderMaterial(this);

    this.generate3DTextures(this.textureA3DMaterial, this.textureA3D);
    this.generate3DTextures(this.textureB3DMaterial, this.textureB3D);
    this.generate2DTextures(this.textureC2DMaterial, this.textureC2D);
  }

  get textures(): (THREE.WebGLRenderTarget | THREE.WebGL3DRenderTarget)[] {
    return [this.textureA3D, this.textureB3D, this.textureC2D];
  }

  generate2DTextures(material: THREE.Material, fbo: THREE.WebGLRenderTarget) {
    this.fsQuad.material = material;
    this._gl.setRenderTarget(fbo);
    this.fsQuad.render(this._gl);
    this._gl.setRenderTarget(null);
  }

  generate3DTextures(material: THREE.Material, fbo: THREE.WebGL3DRenderTarget) {
    const d = fbo.depth;

    this.fsQuad.material = material;

    for (let i = 0; i < d; i++) {
      const normalizedDepth = i / d;
      // @ts-ignore
      material.zCoord = normalizedDepth;

      this._gl.setRenderTarget(fbo, i);
      this.fsQuad.render(this._gl);
    }

    this._gl.setRenderTarget(null);
  }

  render(target: THREE.Mesh, camera: THREE.Camera) {
    this._gl.setRenderTarget(this.textureScene);
    this._gl.render(target, camera);
    this._gl.setRenderTarget(null);

    const prevVisible = target.visible;
    target.visible = false;

    const prevAutoClear = this._gl.autoClear;
    this._gl.autoClear = false;

    this.renderMaterial.update(target, camera);
    this.fsQuad.material = this.renderMaterial;
    this._gl.setRenderTarget(null);
    this.fsQuad.render(this._gl);

    this._gl.autoClear = prevAutoClear;
    target.visible = prevVisible;
  }
}
