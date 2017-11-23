import * as THREE from "three";
import { planeMaterial } from "../materials";

class Plane {
  geometry: THREE.PlaneGeometry;
  material: THREE.Material;
  mesh: THREE.Mesh;

  constructor(value: number, axis: "x" | "y" | "z") {
    this.geometry = new THREE.PlaneGeometry(12, 12, 1, 1);
    this.material = planeMaterial;
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.material.visible = false;
    switch (axis) {
      case "x":
        this.geometry.rotateY(Math.PI / 2);
        this.geometry.translate(value, 0, 0);
        // this.mesh.position.z = value;
        break;
      case "y":
        // this.mesh.position.y = value;
        // this.mesh.rotateX(Math.PI/2)
        this.geometry.rotateX(Math.PI / 2);
        this.geometry.translate(0, value, 0);
        break;
      case "z":
        this.geometry.translate(0, 0, value);
        // this.mesh.position.z = value;
        break;
    }
  }
}

export default Plane;
