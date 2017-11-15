import * as THREE from "three";

class Model {
  geometry: THREE.Geometry;
  material: THREE.Material;
  mesh: THREE.Mesh;

  constructor() {
    this.geometry = new THREE.BoxGeometry(2, 2, 2);
    this.material = new THREE.MeshBasicMaterial({
      color: "red",
      wireframe: true
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  get position(): THREE.Vector3 {
    return this.mesh.position;
  }

  set position(newPosition: THREE.Vector3) {
    this.mesh.position = newPosition;
  }
}

export default Model;
