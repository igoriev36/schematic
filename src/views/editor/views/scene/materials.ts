import * as THREE from "three";
import Config from "../../config";

export const edgeMaterial = new THREE.LineBasicMaterial({
  color: Config.colors.edge,
  linewidth: 1,
  transparent: false
});

export const faceMaterial = new THREE.MeshBasicMaterial({
  // color: Config.colors.face,
  vertexColors: THREE.FaceColors,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  overdraw: 0.5,
  side: THREE.FrontSide,
  // wireframe: true,
  transparent: false
  // polygonOffsetUnits: 100
});

export const lineMaterial = new THREE.LineBasicMaterial({
  color: Config.colors.line,
  linewidth: 4,
  overdraw: 0.5,
  transparent: false
});

export const pieceExtrudeSettings = {
  amount: 0.018,
  bevelEnabled: false,
  steps: 1,
  transparent: false
};
