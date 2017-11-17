import { Point } from "./point";

class Block {
  points: Point[];
  constructor(tl: Point, tr: Point, br: Point, bl: Point) {
    this.points = [tl, tr, br, bl];
  }
}

export default Block;
