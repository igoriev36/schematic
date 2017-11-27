import {
  Point,
  distance,
  rotateAroundPoint,
  angle,
  pointOnLine
} from "../utils/point";

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
// const wall = (wallWidth:number, wallHeight:number):Point[] => [
//   [0,0],
//     [wallHeight,0],
//     [wallHeight, 10],
//     [wallHeight-10, 10],
//     [wallHeight-10, 20],
//     [wallHeight, 20],
//   [wallHeight,wallWidth],
//   [0,wallWidth]
// ]

// prettier-ignore
const wall = (wallWidth:number, wallHeight:number, i, total):Point[] => {
  let p = []

  // if (i < total - 1) {
  //   for (let i = 0; i < 12; i+=2) {
  //     p.push([wallHeight, i*10])
  //     p.push([wallHeight, i*10+10])
  //     p.push([wallHeight-10, i*10+10])
  //     p.push([wallHeight-10, i*10+20])
  //     p.push([wallHeight, i*10+20])
  //   }
  // } else {
    p.push([wallHeight, 0])
  // }

  p.push([wallHeight,wallWidth])

  // if (i > 0) {
  //   p.push([-10,wallWidth])
  //   p.push([-10,0])
  // } else {
    p.push([0,wallWidth])
    p.push([0,0])
  // }

  return (p as Point[])
}

interface Piece {
  pts: Point[];
  pos: Point;
  angle: number;
}

class VanillaWall {
  pieces: Piece[] = [];

  constructor(width: number, /*angle: number,*/ start, end) {
    const length = Math.round(distance(start, end));
    const _angle = angle(start, end);
    const getPos = pointOnLine(start, end);
    const pieceLengths = pieces(length, maxPieceLength);

    const total = pieceLengths.length;

    for (let i = 0; i < total; i++) {
      this.pieces.push({
        pos: getPos(maxPieceLength * i),
        pts: wall(120, pieceLengths[i], i, total),
        angle: _angle
      });
    }
  }
}

export default VanillaWall;
