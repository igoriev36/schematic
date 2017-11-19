import "three/examples/js/controls/OrbitControls";
import * as THREE from "three";

function SceneControls(
  camera: THREE.Camera,
  domElement: HTMLElement
): THREE.OrbitControls {
  const controls = new THREE.OrbitControls(camera, domElement);
  controls.enableZoom = true;
  controls.minDistance = 2;
  controls.maxDistance = 80;
  controls.enableDamping = true;
  controls.dampingFactor = 0.4;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.enableZoom = true;
  return controls;
}

export default SceneControls;
