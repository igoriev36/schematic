import * as THREE from "three";

export function getPosition(
  x: number,
  y: number,
  width: number,
  height: number
): [number, number] {
  return [x / width * 2 - 1, -(y / height) * 2 + 1];
}

export function get2DCoords(
  position: THREE.Vector3,
  camera: THREE.Camera
): THREE.Vector3 {
  let vector = position.project(camera);
  vector.x = (vector.x + 1) / 2 * window.innerWidth; // * window.devicePixelRatio;
  vector.y = -(vector.y - 1) / 2 * window.innerHeight; // * window.devicePixelRatio;
  return vector;
}
