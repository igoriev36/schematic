import {
  Point,
  distance,
  pointOnLine,
  percentageOnLine,
  angle,
  rotateAroundPoint
} from "./point";

import Block from "./block";

import { loopifyInPairs } from "./list";
import { offset } from "./clipper";

const pointDistance = 15;
const finWidth = 12.5;

interface Line {
  subPoints: Point[];
  outerSubPoints: Point[];
  innerSubPoints: Point[];
  angle: number;
  length: number;
  blocks?: Block[];
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
      let i = 0;

      for (i = pointDistance; i < halfLength; i += pointDistance * 2) {
        subPoints.push(pointOnLine(i)(start, end));
      }
      const lastPoints: Point[] = [];
      for (i = pointDistance; i < halfLength; i += pointDistance * 2) {
        lastPoints.push(pointOnLine(i)(end, start));
      }
      subPoints.push(...lastPoints.reverse());

      let outerSubPoints = [];
      let innerSubPoints = [];
      subPoints.forEach(point => {
        const rotate = rotateAroundPoint(point, lineAngle);
        outerSubPoints.push(rotate([point[0], point[1] + finWidth]));
        innerSubPoints.push(rotate([point[0], point[1] - finWidth]));
      });

      let blocks = [];
      for (i = 0; i < subPoints.length - 1; i++) {
        blocks.push(
          new Block(
            outerSubPoints[i],
            outerSubPoints[i + 1],
            innerSubPoints[i + 1],
            innerSubPoints[i]
          )
        );
      }

      return {
        angle: lineAngle,
        length,
        subPoints,
        outerSubPoints,
        innerSubPoints,
        blocks
      };
    });
  };
}

export default Wren;
