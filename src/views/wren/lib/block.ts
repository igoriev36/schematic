import { Point, distance, rotateAroundPoint } from "./point";

const blockWidth = 30;
const blockHeight = 25;
const tabWidth = 18;
const tabOffset = (blockWidth - 18) / 2;
const tabHeight = 1.8;

// prettier-ignore
const standardBlock = [
  [0,0],
    [tabOffset,0],
    [tabOffset,-tabHeight],
    [tabOffset+tabWidth,-tabHeight],
    [tabOffset+tabWidth,0],
  [blockWidth,0],
  [blockWidth,blockHeight],
    [blockWidth-tabOffset,blockHeight],
    [blockWidth-tabOffset,blockHeight+tabHeight],
    [blockWidth-tabOffset-tabWidth,blockHeight+tabHeight],
    [blockWidth-tabOffset-tabWidth,blockHeight],
  [0,blockHeight]
]

class Block {
  points: Point[];
  type: string;
  types = {
    FILLER: "filler",
    STANDARD: "standard"
  };

  constructor(
    angle: number,
    anchor: Point,
    tl: Point,
    tr: Point,
    br: Point,
    bl: Point
  ) {
    const width = Math.round(distance(tl, tr));
    if (width === 30) {
      this.type = this.types.STANDARD;
      this.points = standardBlock
        .map(([x, y]): Point => [x + bl[0], y + bl[1]])
        .map(rotateAroundPoint(bl, angle));
    } else {
      this.type = this.types.FILLER;
      this.points = [tl, tr, br, bl];
    }
    // this.points = [tl, tr, br, bl];
  }
}

export default Block;
