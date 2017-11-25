import * as THREE from "three";
import { planeMaterial, pointsMaterial, cutLineMaterial } from "../materials";

class CuttingPlane {
  geometry: THREE.PlaneGeometry;
  material: THREE.Material;
  mesh: THREE.Mesh;

  dragPlane: THREE.Plane = new THREE.Plane();

  intersectionGeometry: THREE.Geometry = new THREE.Geometry();
  intersectionPoints: THREE.Points;
  intersectionLines: THREE.LineSegments;

  setPointOfIntersection = (line, plane) => {
    let pointOfIntersection = plane.intersectLine(line);
    if (pointOfIntersection) {
      this.intersectionGeometry.vertices.push(pointOfIntersection.clone());
    }
  };

  intersect = model => {
    this.intersectionGeometry.vertices.splice(
      0,
      this.intersectionGeometry.vertices.length
    );

    let a = new THREE.Vector3();
    let b = new THREE.Vector3();
    let c = new THREE.Vector3();
    let planePointA = new THREE.Vector3();
    let planePointB = new THREE.Vector3();
    let planePointC = new THREE.Vector3();
    let lineAB = new THREE.Line3();
    let lineBC = new THREE.Line3();
    let lineCA = new THREE.Line3();

    let mathPlane = new THREE.Plane();
    this.mesh.localToWorld(
      planePointA.copy(this.geometry.vertices[this.geometry.faces[0].a])
    );
    this.mesh.localToWorld(
      planePointB.copy(this.geometry.vertices[this.geometry.faces[0].b])
    );
    this.mesh.localToWorld(
      planePointC.copy(this.geometry.vertices[this.geometry.faces[0].c])
    );

    mathPlane.setFromCoplanarPoints(planePointA, planePointB, planePointC);
    model.geometry.faces.forEach(face => {
      model.mesh.localToWorld(a.copy(model.geometry.vertices[face.a]));
      model.mesh.localToWorld(b.copy(model.geometry.vertices[face.b]));
      model.mesh.localToWorld(c.copy(model.geometry.vertices[face.c]));
      lineAB = new THREE.Line3(a, b);
      lineBC = new THREE.Line3(b, c);
      lineCA = new THREE.Line3(c, a);
      this.setPointOfIntersection(lineAB, mathPlane);
      this.setPointOfIntersection(lineBC, mathPlane);
      this.setPointOfIntersection(lineCA, mathPlane);
    });

    this.intersectionGeometry.verticesNeedUpdate = true;
  };

  constructor(value: number, axis: "x" | "y" | "z") {
    this.geometry = new THREE.PlaneGeometry(12, 12, 1, 1);
    this.material = planeMaterial;
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.material.visible = true;

    this.intersectionPoints = new THREE.Points(
      this.intersectionGeometry,
      pointsMaterial
    );
    this.intersectionLines = new THREE.LineSegments(
      this.intersectionGeometry,
      cutLineMaterial
    );

    switch (axis) {
      case "x":
        this.geometry.rotateY(Math.PI / 2);
        this.geometry.translate(value, 0, 0);
        this.dragPlane.translate(new THREE.Vector3(0, 0, value));
        break;
      case "y":
        this.geometry.rotateX(Math.PI / 2);
        this.geometry.translate(0, value, 0);
        break;
      case "z":
        this.geometry.translate(0, 0, value);
        break;
    }
    this.geometry.verticesNeedUpdate = true;
    this.geometry.computeBoundingBox();
    this.geometry.computeBoundingSphere();
  }
}

export default CuttingPlane;
