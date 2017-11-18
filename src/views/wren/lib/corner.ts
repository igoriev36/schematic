import { Point } from "./point";

class Corner {
  points: Point[];

  constructor(tl: Point, t: Point, tr: Point, br: Point, b: Point, bl: Point) {
    this.points = [tl, t, tr, br, b, bl];
  }
}

export default Corner;
