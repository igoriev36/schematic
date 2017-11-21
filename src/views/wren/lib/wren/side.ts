import * as THREE from "three";
import {
  distance,
  angle as pointAngle,
  rotateAroundPoint
} from "../utils/point";
import { Point } from "../utils/point";

const maxPieceLength = 240;

const pieces = (_totalLength, maxPieceLength) => {
  let length = _totalLength;
  let lengths = [];
  while (length > 0) {
    if (length > maxPieceLength) {
      lengths.push(maxPieceLength);
    } else {
      lengths.push(length);
    }
    length -= maxPieceLength;
  }
  return lengths;
};

// prettier-ignore
const wall = (wallWidth:number, wallHeight:number):Point[] => [
  [0,0],
  [wallHeight,0],
  [wallHeight,wallWidth],
  [0,wallWidth]
]

interface IVector {
  x: number;
  y: number;
  z: number;
  o?: string;
}

interface Piece {
  pts: Point[];
  rot: IVector;
  pos: IVector;
  angle: number;
}

class Side {
  pieces: Piece[] = [];

  constructor(start, end, pos = { x: 0, y: 0, z: 0 }, rotationOverrides = {}) {
    const length = distance(start, end);
    const angle = pointAngle(start, end);

    const rot = { x: 0, y: 0, z: Math.PI / 2 - angle, o: "ZYX" };
    const newRot = { ...rot, ...rotationOverrides };

    const startPosition = new THREE.Vector3(pos.x, pos.y, pos.z);
    const euler = new THREE.Euler(newRot.x, newRot.y, newRot.z, newRot.o);

    const direction = startPosition
      .clone()
      .applyEuler(euler)
      .normalize();

    const pieceLengths = pieces(length, maxPieceLength);
    let allPieces = [];

    for (let i = 0; i < pieceLengths.length; i++) {
      let newPos = startPosition
        .clone()
        .add(new THREE.Vector3(0, maxPieceLength * i, 0).applyEuler(euler));

      this.pieces.push({
        pts: wall(120, pieceLengths[i]),
        pos: newPos,
        rot: newRot,
        angle
      });
    }
  }
}

export default Side;
