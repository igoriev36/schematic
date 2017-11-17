import {
  Point,
  midpoint,
  distance,
  pointOnLine,
  percentageOnLine
} from "./point";
import { loopifyInPairs } from "./list";

const pointDistance = 15;

class Wren {
  points: Point[];
  midpoints: Point[];
  subPoints: Point[][] = [];

  constructor(points) {
    this.points = points;
    this.midpoints = loopifyInPairs(points).map(([start, end]) =>
      midpoint(start, end)
    );

    loopifyInPairs(points).map(([start, end], index) => {
      const points: Point[] = [];
      const halfLength = distance(start, end) / 2;
      for (let i = pointDistance; i < halfLength; i += pointDistance * 2) {
        points.push(pointOnLine(i)(start, end));
      }
      const lastPoints: Point[] = [];
      for (let i = pointDistance; i < halfLength; i += pointDistance * 2) {
        lastPoints.push(pointOnLine(i)(end, start));
      }
      points.push(...lastPoints.reverse());
      this.subPoints[index] = points;
    });
  }
}

export default Wren;
