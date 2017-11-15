import * as THREE from "three";

class Model {
  geometry: THREE.Geometry;
  material: THREE.Material;
  mesh: THREE.Mesh;
  faceColor: THREE.Color;
  faceHighlightColor: THREE.Color;

  constructor(faceColor: number, faceHighlightColor: number) {
    this.geometry = new THREE.BoxGeometry(2, 2, 2);
    this.material = new THREE.MeshBasicMaterial({
      color: faceColor,
      vertexColors: THREE.FaceColors
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.faceColor = new THREE.Color(faceColor);
    this.faceHighlightColor = new THREE.Color(faceHighlightColor);
  }

  get position(): THREE.Vector3 {
    return this.mesh.position;
  }

  set position(newPosition: THREE.Vector3) {
    this.mesh.position = newPosition;
  }
}

export default Model;
