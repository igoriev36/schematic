import * as THREE from "three";

class Axes extends THREE.Object3D {
  constructor(
    length: number,
    position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  ) {
    super();
    const arr = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    arr.forEach(([x, y, z]) => {
      this.add(
        new THREE.ArrowHelper(
          new THREE.Vector3(x, y, z),
          position,
          length,
          parseInt(
            [x, y, z].reduce((str, n) => str.concat(n === 1 ? "FF" : "00"), ""),
            16
          ),
          0.15,
          0.1
        )
      );
    });
  }
}

export default Axes;
