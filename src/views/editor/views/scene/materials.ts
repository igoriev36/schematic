import * as THREE from "three";
import Config from "../../config";

export const edgeMaterial = new THREE.LineBasicMaterial({
  color: Config.colors.edge,
  linewidth: 1
});

export const faceMaterial = new THREE.MeshBasicMaterial({
  color: Config.colors.face,
  vertexColors: THREE.FaceColors,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  overdraw: 0.5
  // polygonOffsetUnits: 100
});

export const lineMaterial = new THREE.LineBasicMaterial({
  color: Config.colors.line,
  linewidth: 4,
  overdraw: 0.5
});

export const pieceExtrudeSettings = {
  amount: 0.018,
  bevelEnabled: false,
  steps: 1
};
