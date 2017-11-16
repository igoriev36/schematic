import * as THREE from "three";

export default function DebugArrows(): {
  arrows: THREE.Object3D;
  blue: THREE.Vector3;
  green: THREE.Vector3;
} {
  const arrows = new THREE.Object3D();
  const zero = new THREE.Vector3();
  // arrows.add(
  //   new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), zero, 2, 0x000000)
  // );
  const blue = new THREE.Vector3(0, 0, 1);
  const green = new THREE.Vector3(0, 1, 0);

  arrows.add(new THREE.ArrowHelper(green, zero, 2, 0x00ff00));
  arrows.add(new THREE.ArrowHelper(blue, zero, 2, 0x0000ff));
  return {
    arrows,
    blue,
    green
  };
}
