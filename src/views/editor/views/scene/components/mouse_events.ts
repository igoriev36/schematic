import { getPosition } from "../libs/utils";
import { nearlyEqual } from "../libs/vector";
import * as THREE from "three";
import * as React from "react";

export const handleMouseMove = (
  width,
  height,
  raycaster: THREE.Raycaster,
  camera: THREE.PerspectiveCamera,
  object: THREE.Mesh
) => (event: React.MouseEvent<HTMLDivElement>) => {
  const [x, y] = getPosition(event.clientX, event.clientY, width, height);

  raycaster.setFromCamera({ x, y }, camera);

  const intersects = raycaster.intersectObject(object, false);

  console.log(intersects.length);

  // if (intersects.length > 0) {
  //   this.activeIntersection = intersects[0];

  //   if (!this.mouseDown) {
  //     // highlight closest edge
  //     const positions = this.activeModel.edgesGeometry.getAttribute(
  //       "position"
  //     ).array as number[];
  //     let minDistance = Infinity;
  //     let j = undefined;
  //     for (let i = 0; i < positions.length; i += 2) {
  //       this.line.start.fromArray(positions, i * 3);
  //       this.line.end.fromArray(positions, i * 3 + 3);
  //       let closestPoint = this.line.closestPointToPoint(
  //         this.activeIntersection.point
  //       );
  //       let distance = closestPoint.distanceTo(this.activeIntersection.point);
  //       if (distance < minDistance) {
  //         minDistance = distance;
  //         j = i;
  //       }
  //     }

  //     j *= 3;

  //     let needsUpdate = false;
  //     // prettier-ignore
  //     if (minDistance < 0.08) {
  //       this.lineHelper.visible = true;
  //       // (this.lineHelper.geometry as THREE.Geometry).vertices[0] = new THREE.Vector3().fromArray(positions, j*3);
  //       if (
  //         (this.lineHelper.geometry as THREE.Geometry).vertices[0].x !== positions[j] ||
  //         (this.lineHelper.geometry as THREE.Geometry).vertices[0].y !== positions[j+1] ||
  //         (this.lineHelper.geometry as THREE.Geometry).vertices[0].z !== positions[j+2]
  //       ) {
  //         needsUpdate = true;
  //         (this.lineHelper.geometry as THREE.Geometry).vertices[0] = new THREE.Vector3().fromArray(positions, j);
  //       }
  //       // (this.lineHelper.geometry as THREE.Geometry).vertices[1] = new THREE.Vector3().fromArray(positions, j*3+3);
  //       if (
  //         (this.lineHelper.geometry as THREE.Geometry).vertices[1].x !== positions[j+3] ||
  //         (this.lineHelper.geometry as THREE.Geometry).vertices[1].y !== positions[j+4] ||
  //         (this.lineHelper.geometry as THREE.Geometry).vertices[1].z !== positions[j+5]
  //       ) {
  //         needsUpdate = true;
  //         (this.lineHelper.geometry as THREE.Geometry).vertices[1] = new THREE.Vector3().fromArray(positions, j+3);
  //       }
  //       if (needsUpdate) {
  //         (this.lineHelper.geometry as THREE.Geometry).verticesNeedUpdate = true;
  //         // requestAnimationFrame(this.render3);
  //       }

  //     } else {
  //       this.lineHelper.visible = false;

  //       // highlight active face
  //       this.activeModel.geometry.faces.forEach(face => {
  //         if (nearlyEqual(face.normal, this.activeIntersection.face.normal)) {
  //           if (!face.color.equals(this.activeModel.faceHighlightColor)) {
  //             this.faceColor$.next([face, this.props.colors.faceHighlight]);
  //           }
  //         } else {
  //           if (!face.color.equals(this.activeModel.faceColor)) {
  //             this.faceColor$.next([face, this.props.colors.face]);
  //           }
  //         }
  //       });

  //     }
  //   }

  //   if (this.mouseDown) {
  //     const { normal } = this.activeIntersection.face;
  //     if (
  //       this.raycaster.ray.intersectPlane(
  //         this.plane,
  //         this.planeIntersection
  //       )
  //       // normal.z > 0.999999) ||
  //       // normal.z < -0.999999 ||
  //       // normal.x > 0.999999 ||
  //       // normal.x < -0.999999
  //     ) {
  //       const toAdd = new THREE.Vector3().multiplyVectors(
  //         this.activeNormal,
  //         this.planeIntersection.clone().sub(this.clickPoint.clone())
  //       );
  //       let count = 0;
  //       this.activeVertices.forEach(v => {
  //         this.vertices$.next([
  //           v,
  //           this.originalVertices[count].clone(),
  //           toAdd
  //         ]);
  //         count++;
  //       });
  //     }
  //   }
  // } else {
  //   this.activeIntersection = undefined;
  //   this.activeNormal = undefined;
  //   this.activeModel.geometry.faces
  //     .filter(face => !face.color.equals(this.activeModel.faceColor))
  //     .forEach(face => {
  //       this.faceColor$.next([face, this.props.colors.face]);
  //     });
  // }

  // // TODO: send a done/commit signal, so it doesn't need to debounce
};

export const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
  console.log(event);
  // this.mouseDown = false;
  // this.controls.enabled = true;
  // this.activeVertices.clear();
};

export const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
  console.log(event);
  // const { normal } = this.activeIntersection.face;
  // this.mouseDown = true;
  // if (this.activeIntersection) {
  //   this.activeNormal =
  //     normal.x + normal.y + normal.z < 0
  //       ? normal.clone().negate()
  //       : normal.clone();

  //   this.controls.enabled = false;
  //   this.clickPoint = this.activeIntersection.point;

  //   this.activeVertices = ((this.activeIntersection.object as THREE.Mesh)
  //     .geometry as THREE.Geometry).faces
  //     .filter(f => nearlyEqual(f.normal, normal))
  //     .reduce((set, f) => {
  //       set.add(this.activeModel.geometry.vertices[f.a]);
  //       set.add(this.activeModel.geometry.vertices[f.b]);
  //       set.add(this.activeModel.geometry.vertices[f.c]);
  //       return set;
  //     }, new Set());
  //   this.originalVertices = [...this.activeVertices].map(v => v.clone());

  //   this.debugPlane.position.copy(this.activeIntersection.point);
  //   this.debugPlane.lookAt(this.activeIntersection.point.clone().add(normal));

  //   this.plane.setFromCoplanarPoints(
  //     this.activeIntersection.point,
  //     this.debugPlane.localToWorld(this.debugPlane.userData.green.clone()),
  //     this.debugPlane.localToWorld(this.debugPlane.userData.blue.clone()),
  //   );

  // }
};

export const handleMouseWheel = (event: React.WheelEvent<HTMLDivElement>) => {
  console.log(event);
  // // TODO: fix bug where target is broken after zoom
  // // https://stackoverflow.com/questions/23994206/zoom-to-object-in-threejs/30514984#30514984
  // const factor = -event.deltaY / 50;
  // const [x, y] = getPosition(
  //   event.clientX,
  //   event.clientY,
  //   this.props.width,
  //   this.props.height
  // );
  // var vector = new THREE.Vector3(x, y, 1);
  // vector.unproject(this.camera);
  // vector.sub(this.camera.position);
  // this.camera.position.addVectors(
  //   this.camera.position,
  //   vector.setLength(factor)
  // );
  // this.controls.target.addVectors(
  //   this.controls.target,
  //   vector.setLength(factor)
  // );
};
