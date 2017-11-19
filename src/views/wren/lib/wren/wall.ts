import { Point, distance, rotateAroundPoint } from "../utils/point";

// prettier-ignore
const wall = (wallWidth:number, wallHeight:number) => [
  [0,0],
  [wallHeight,0],
  [wallHeight,-wallWidth],
  [0,-wallWidth]
]

class Wall {
  points: Point[];
  constructor(width: number, anchor: Point, angle: number, points: Point[]) {
    const length = Math.round(distance(points[0], points[1]));
    this.points = wall(width, length)
      .map(([x, y]): Point => [x + points[0][0], y + points[0][1]])
      .map(rotateAroundPoint(anchor, angle));
  }
}

export default Wall;
