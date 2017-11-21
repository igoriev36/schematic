import { Point, distance, rotateAroundPoint } from "../utils/point";

const blockWidth = 30;
const blockHeight = 25;
const tabWidth = 18;
const tabOffset = (blockWidth - 18) / 2;
const tabHeight = 1.8;

// prettier-ignore
const standardBlock = [
  [[0,0],
    [tabOffset,0],
    [tabOffset,-tabHeight],
    [tabOffset+tabWidth,-tabHeight],
    [tabOffset+tabWidth,0],
  [blockWidth,0]],
  [[blockWidth, blockHeight],
    [blockWidth-tabOffset, blockHeight],
    [blockWidth-tabOffset, blockHeight+tabHeight],
    [blockWidth-tabOffset-tabWidth, blockHeight+tabHeight],
    [blockWidth-tabOffset-tabWidth, blockHeight],
  [0, blockHeight]]
]

// prettier-ignore
const specialBlock = [
  [[0,0],
    [tabOffset*10,0],
    [tabOffset*10,-tabHeight],
    [tabOffset+tabWidth,-tabHeight],
    [tabOffset+tabWidth,0],
  [blockWidth,0]],
  [[blockWidth,blockHeight*2],
    [blockWidth-tabOffset,blockHeight*2],
    [blockWidth-tabOffset,blockHeight*2+tabHeight],
    [blockWidth-tabOffset-tabWidth,blockHeight*2+tabHeight],
    [blockWidth-tabOffset-tabWidth,blockHeight*2],
  [0,blockHeight]]
]

class Block {
  outerPoints: Point[] = [];
  innerPoints: Point[] = [];

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
    bl: Point,
    columns: number[]
  ) {
    const width = Math.round(distance(tl, tr));

    let isColumn = false;

    if (width === 30) {
      this.type = this.types.STANDARD;
      this.outerPoints = standardBlock[0]
        .map(([x, y]): Point => [x + bl[0], y + bl[1]])
        .map(rotateAroundPoint(bl, angle));

      if (anchor[1] >= 400) {
        for (let i = 0; i < columns.length; i++) {
          if (anchor[0] > columns[i] && anchor[0] < columns[i] + width) {
            isColumn = true;
          }
        }
      }

      if (isColumn) {
        this.innerPoints = specialBlock[1]
          .map(([x, y]): Point => [x + bl[0], y + bl[1]])
          .map(rotateAroundPoint(bl, angle));
      } else {
        this.innerPoints = standardBlock[1]
          .map(([x, y]): Point => [x + bl[0], y + bl[1]])
          .map(rotateAroundPoint(bl, angle));
      }
    } else {
      this.type = this.types.FILLER;
      // this.innerPoints = [tl, tr];
      // this.outerPoints = [br, bl];
    }
    // this.points = [tl, tr, br, bl];
  }

  get points(): Point[] {
    return [...this.outerPoints, ...this.innerPoints];
  }
}

export default Block;
