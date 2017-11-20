import * as THREE from "three";
import { lineMaterial } from "../materials";

class LineHelper extends THREE.Line {
  constructor() {
    const geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    super(geometry, lineMaterial);
  }
}

export default LineHelper;
