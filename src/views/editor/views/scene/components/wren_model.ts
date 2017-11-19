import Wren from "../../../../wren/lib/wren";
import * as THREE from "three";
import { edgeMaterial, faceMaterial, pieceExtrudeSettings } from "../materials";

class WrenModel {
  wren: Wren;
  geometry: THREE.Geometry;
  mesh: THREE.Mesh;

  addFin = distance => {
    const geometry = new THREE.Geometry();
    this.addPieces(geometry, "finPieces", distance);
    this.addPieces(geometry, "reinforcers", distance, 0.0036);
    this.addWalls(geometry, "outerWalls", distance);
    this.addWalls(geometry, "innerWalls", distance);
    return geometry;
  };

  addWalls = (geometry: THREE.Geometry, pieceName: string, index) => {
    this.wren[pieceName].forEach(finPiece => {
      const shape = new THREE.Shape();
      finPiece.map(([x, y]) => [x / 100, y / 100]).forEach(([x, y], index) => {
        if (index == 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
      const g = new THREE.ExtrudeGeometry(shape, pieceExtrudeSettings);
      const mesh = new THREE.Mesh(g);
      mesh.position.z = index;
      // mesh.position.z = 2;
      // mesh.rotateY(Math.PI/2)
      geometry.mergeMesh(mesh);
    });
  };

  addPieces = (
    geometry: THREE.Geometry,
    pieceName: string,
    index,
    translateDistance = 0
  ) => {
    this.wren[pieceName].forEach(finPiece => {
      const shape = new THREE.Shape();
      finPiece.map(([x, y]) => [x / 100, y / 100]).forEach(([x, y], index) => {
        if (index == 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
      const geo = new THREE.ExtrudeGeometry(shape, pieceExtrudeSettings);
      geo.translate(0, 0, index);
      geometry.merge(geo);
    });
  };

  constructor(wren: Wren, face, faceHighlight) {
    this.wren = wren;
    this.geometry = new THREE.Geometry();
    for (let i = 0; i < 3; i++) {
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
