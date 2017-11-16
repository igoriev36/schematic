import * as THREE from "three";

function DebugPlane(): THREE.Mesh {
  const planeGeometry = new THREE.PlaneGeometry(3, 3, 1, 1);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: "red",
    opacity: 0.2,
    transparent: true,
    side: THREE.DoubleSide
  });
  return new THREE.Mesh(planeGeometry, planeMaterial);
}

export default DebugPlane;
