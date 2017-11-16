import * as THREE from "three";
import Config from "../../config";

export const edgeMaterial = new THREE.LineBasicMaterial({
  color: Config.colors.edge,
  linewidth: 1,
  overdraw: 1
});

export const faceMaterial = new THREE.MeshBasicMaterial({
  color: Config.colors.face,
  vertexColors: THREE.FaceColors
});
