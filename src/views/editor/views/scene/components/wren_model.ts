import Wren from "../../../../wren/lib/wren";
import * as THREE from "three";
import { edgeMaterial, faceMaterial, pieceExtrudeSettings } from "../materials";

class WrenModel {
  container: THREE.Object3D;
  wren: Wren;
  geometry: THREE.Geometry;
  edgesGeometry: THREE.EdgesGeometry;
  mesh: THREE.Mesh;
  lineSegments: THREE.LineSegments;

  update = (wren: Wren, length: number) => {
    this.wren = wren;
    this.geometry.dispose();
    this.geometry = new THREE.Geometry();
    for (let i = 0; i < length; i++) {
      this.geometry.merge(this.addFin(i));
    }
    this.mesh.geometry = this.geometry;

    this.edgesGeometry.dispose();
    this.edgesGeometry = new THREE.EdgesGeometry(<any>this.geometry, 1);
    this.lineSegments.geometry = this.edgesGeometry;
  };

  constructor(wren: Wren, face, faceHighlight) {
    this.wren = wren;
    this.geometry = new THREE.Geometry();
    for (let i = 0; i < 1; i++) {
      this.geometry.merge(this.addFin(i));
    }
    this.mesh = new THREE.Mesh(this.geometry, faceMaterial);
    this.edgesGeometry = new THREE.EdgesGeometry(<any>this.geometry, 1);
    this.lineSegments = new THREE.LineSegments(
      this.edgesGeometry,
      edgeMaterial
    );
    this.mesh.add(this.lineSegments);

    this.container = new THREE.Object3D();
    this.container.add(this.mesh);
  }

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
}

export default WrenModel;
