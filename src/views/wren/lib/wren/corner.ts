import { Point } from "../utils/point";

class Corner {
  outerPoints: Point[];
  innerPoints: Point[];

  constructor(tl: Point, t: Point, tr: Point, br: Point, b: Point, bl: Point) {
    this.outerPoints = [tl, t, tr];
    this.innerPoints = [br, b, bl];
  }

  get points(): Point[] {
    return [...this.outerPoints, ...this.innerPoints];
  }
}

export default Corner;
