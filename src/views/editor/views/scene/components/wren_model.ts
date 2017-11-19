import Wren from "../../../../wren/lib/wren";
import * as THREE from "three";
import { edgeMaterial, faceMaterial, pieceExtrudeSettings } from "../materials";

class WrenModel {
  wren: Wren;
  geometry: THREE.Geometry;
  mesh: THREE.Mesh;

  addFin = distance => {
    const geometry = new THREE.Geometry();
    this.addPieces(geometry, "finPieces");
    this.addPieces(geometry, "reinforcers", 0.0036);
    geometry.translate(0, 0, distance);
    return geometry;
  };

  addPieces = (
    geometry: THREE.Geometry,
    pieceName: string,
    translateDistance = 0
  ) => {
    this.wren[pieceName].forEach(finPiece => {
      const shape = new THREE.Shape();
      finPiece.map(([x, y]) => [x / 100, y / 100]).forEach(([x, y], index) => {
        if (index == 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
      geometry.translate(0, 0, translateDistance);
      geometry.merge(new THREE.ExtrudeGeometry(shape, pieceExtrudeSettings));
    });
  };

  constructor(wren: Wren, face, faceHighlight) {
    this.wren = wren;
    this.geometry = new THREE.Geometry();
    for (let i = 0; i < 6; i++) {
      this.geometry.merge(this.addFin(i));
    }
    const mesh = new THREE.Mesh(this.geometry, faceMaterial);
    const edgesGeometry = new THREE.EdgesGeometry(<any>this.geometry, 1);
    const lineSegments = new THREE.LineSegments(edgesGeometry, edgeMaterial);
    mesh.add(lineSegments);

    this.mesh = mesh;
  }
}

export default WrenModel;
