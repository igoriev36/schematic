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
const wall = (wallWidth:number, wallHeight:number):Point[] => [
  [0,0],
  [wallHeight,0],
  [wallHeight,wallWidth],
  [0,wallWidth]
]

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

    for (let i = 0; i < pieceLengths.length; i++) {
      this.pieces.push({
        pos: getPos(maxPieceLength * i),
        pts: wall(120, pieceLengths[i]),
        angle: _angle
      });
    }
  }
}

export default VanillaWall;
