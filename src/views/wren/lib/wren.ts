import {
  Point,
  midpoint,
  distance,
  pointOnLine,
  percentageOnLine,
  angle,
  rotateAroundPoint
} from "./point";

import { loopifyInPairs } from "./list";
import { offset } from "./clipper";

const pointDistance = 15;
const finWidth = 12.5;

interface Line {
  subPoints: Point[];
  offsetPoints: Point[];
  angle: number;
  length: number;
  midpoint?: Point;
}

class Wren {
  innerPoints: Point[];
  outerPoints: Point[];
  points: Point[];
  lines: Line[];

  constructor(points) {
    this.points = offset(points, { DELTA: 0 });
    this.outerPoints = offset(points, { DELTA: finWidth });
    this.innerPoints = offset(points, { DELTA: -finWidth });
    this.lines = this.calculateLines(points);
  }

  private calculateLines = (_points): Line[] => {
    return loopifyInPairs(_points).map(([start, end], index) => {
      const lineAngle = angle(start, end);
      const subPoints: Point[] = [];
      const length = distance(start, end);
      const halfLength = length / 2;

      for (let i = pointDistance; i < halfLength; i += pointDistance * 2) {
        subPoints.push(pointOnLine(i)(start, end));
      }
      const lastPoints: Point[] = [];
      for (let i = pointDistance; i < halfLength; i += pointDistance * 2) {
        lastPoints.push(pointOnLine(i)(end, start));
      }
      subPoints.push(...lastPoints.reverse());

      return {
        angle: lineAngle,
        subPoints,
        offsetPoints: subPoints.map(point =>
          rotateAroundPoint(point, lineAngle)([point[0], point[1] + finWidth])
        ),
        length,
        midPoint: [1, 1]
      };
    });
  };
}

export default Wren;
