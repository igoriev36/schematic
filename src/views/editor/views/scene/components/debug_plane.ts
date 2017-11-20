import * as THREE from "three";
// import DebugArrows from "./debug_arrows";

function DebugPlane(visible: boolean = true): THREE.Mesh {
  const planeGeometry = new THREE.PlaneGeometry(3, 3, 1, 1);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: "red",
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(planeGeometry, planeMaterial);
  // const debugArrows = DebugArrows();

  mesh.userData.pts = () => {
    mesh.updateMatrixWorld(true);
    return [
      mesh.position,
      mesh.localToWorld(new THREE.Vector3(0, 0, 1)),
      mesh.localToWorld(new THREE.Vector3(0, 1, 0))
    ];
  };
  // mesh.userData.green = debugArrows.green;
  // mesh.userData.blue = debugArrows.blue;
  // mesh.add(debugArrows.arrows);
  mesh.visible = visible;
  return mesh;
}

export default DebugPlane;
