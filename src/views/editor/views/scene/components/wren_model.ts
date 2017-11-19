import Wren from "../../../../wren/lib/wren";
import * as THREE from "three";
import { edgeMaterial, faceMaterial, pieceExtrudeSettings } from "../materials";

class WrenModel {
  wren: Wren;
  geometry: THREE.Geometry;
  mesh: THREE.Mesh;

  addPieces = (pieceName: string, translateDistance = 0) => {
    this.wren[pieceName].forEach(finPiece => {
      const shape = new THREE.Shape();
      finPiece.map(([x, y]) => [x / 100, y / 100]).forEach(([x, y], index) => {
        if (index == 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
      this.geometry.translate(0, 0, translateDistance);
      this.geometry.merge(
        new THREE.ExtrudeGeometry(shape, pieceExtrudeSettings)
      );
    });
  };

  constructor(wren: Wren, face, faceHighlight) {
    this.wren = wren;
    this.geometry = new THREE.Geometry();

    this.addPieces("finPieces");
    this.addPieces("reinforcers", 0.0036);

    const mesh = new THREE.Mesh(this.geometry, faceMaterial);
    const edgesGeometry = new THREE.EdgesGeometry(<any>this.geometry, 1);
    const lineSegments = new THREE.LineSegments(edgesGeometry, edgeMaterial);
    mesh.add(lineSegments);

    this.mesh = mesh;
  }
}

export default WrenModel;
