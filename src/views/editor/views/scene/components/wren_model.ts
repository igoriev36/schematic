import Wren from "../../../../wren/lib/wren";
import * as THREE from "three";
import { edgeMaterial, plyMaterial, pieceExtrudeSettings } from "../materials";

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
    for (let i = 0; i < 3; i++) {
      this.geometry.merge(this.addFin(i));
    }
    this.mesh = new THREE.Mesh(this.geometry, plyMaterial);
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

    this.addPieces(geometry, "finPieces", distance * 1.2 + 0.01);
    this.addPieces(geometry, "reinforcers", distance * 1.2 + 0.01 + 0.0036);

    this.addPieces(geometry, "finPieces", distance * 1.2 + 1 + 0.01);

    // this.addWalls(geometry, "outerWalls", distance);
    // this.addWalls(geometry, "innerWalls", distance);
    // this.addSides(geometry)
    this.addVanillaWalls("vanillaInnerWalls", geometry, distance);
    this.addVanillaWalls("vanillaOuterWalls", geometry, distance);
    return geometry;
  };

  addVanillaWalls = (name, geometry: THREE.Geometry, z) => {
    this.wren[name].forEach(vWall => {
      vWall.pieces.forEach(side => {
        const shape = new THREE.Shape();
        side.pts
          .map(([x, y]) => [x / 100, y / 100])
          .forEach(([x, y], index) => {
            if (index == 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
          });
        const g = new THREE.ExtrudeGeometry(shape, pieceExtrudeSettings);
        const mesh = new THREE.Mesh(g);

        mesh.rotation.z = side.angle;
        mesh.rotation.x = Math.PI / 2;
        mesh.rotation.order = "ZYX";

        mesh.position.x = side.pos[0] / 100;
        mesh.position.y = side.pos[1] / 100;
        mesh.position.z = z * 1.2 - 0.1;

        // mesh.rotation.x = side.rot.x;
        // mesh.rotation.y = side.rot.y;
        // mesh.rotation.z = side.rot.z;
        // mesh.rotation.order = "XYZ"//side.rot.o;

        geometry.mergeMesh(mesh);
      });
    });
  };

  // addSides = (geometry: THREE.Geometry) => {
  //   this.wren.sides.forEach(sside => {
  //     sside.pieces.forEach(side => {
  //       const shape = new THREE.Shape();
  //       side.pts.map(([x, y]) => [x / 100, y / 100]).forEach(([x, y], index) => {
  //         if (index == 0) shape.moveTo(x, y);
  //         else shape.lineTo(x, y);
  //       });
  //       const g = new THREE.ExtrudeGeometry(shape, pieceExtrudeSettings);
  //       const mesh = new THREE.Mesh(g);

  //       mesh.rotation.y = Math.PI;
  //       mesh.rotation.z = side.angle;
  //       mesh.rotation.x = Math.PI/2;
  //       mesh.rotation.order = "ZYX";

  //       mesh.position.x = side.pos.x/100;
  //       mesh.position.y = side.pos.y/100;
  //       mesh.position.z = side.pos.z/100;

  //       // mesh.rotation.x = side.rot.x;
  //       // mesh.rotation.y = side.rot.y;
  //       // mesh.rotation.z = side.rot.z;
  //       // mesh.rotation.order = "XYZ"//side.rot.o;

  //       geometry.mergeMesh(mesh);
  //     })
  //   })
  // }

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

  addPieces = (geometry: THREE.Geometry, pieceName: string, index) => {
    // console.log(this.wren[pieceName])
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
