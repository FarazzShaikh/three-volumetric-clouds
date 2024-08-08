import * as THREE from "three";

class FullscreenTriangleGeometry extends THREE.BufferGeometry {
  constructor() {
    super();
    this.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)
    );
    this.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2)
    );
  }
}

export class FullScreenQuad {
  private _geometry: FullscreenTriangleGeometry;
  private _mesh: THREE.Mesh;
  private _camera: THREE.OrthographicCamera;

  constructor(material?: THREE.Material) {
    this._geometry = new FullscreenTriangleGeometry();
    this._mesh = new THREE.Mesh(this._geometry, material);
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  dispose() {
    this._mesh.geometry.dispose();
  }

  render(renderer: THREE.WebGLRenderer) {
    renderer.render(this._mesh, this._camera);
  }

  get material() {
    return this._mesh.material;
  }

  set material(value) {
    this._mesh.material = value;
  }
}
