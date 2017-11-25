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
  wireframe: false,
  transparent: true,
  opacity: 0.3
  // polygonOffsetUnits: 100
});

export const plyMaterial = new THREE.MeshLambertMaterial({
  // color: 0x303030,
  color: Config.colors.ply,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  overdraw: 0.5,
  side: THREE.FrontSide,
  transparent: false,
  wireframe: false,
  flatShading: true
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

export const planeMaterial = new THREE.MeshNormalMaterial({
  side: THREE.DoubleSide,
  opacity: 0.1,
  transparent: true
});

export const pointsMaterial = new THREE.PointsMaterial({
  size: 0.5,
  color: 0xffff00
});

export const cutLineMaterial = new THREE.LineBasicMaterial({
  color: 0xaaaaaa
});
