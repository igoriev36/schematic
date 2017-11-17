import {
  Point,
  midpoint,
  distance,
  pointOnLine,
  percentageOnLine
} from "./point";
import { loopifyInPairs } from "./list";

class Wren {
  points: Point[];
  midpoints: Point[];
  subPoints: Point[] = [];

  constructor(points) {
    this.points = points;
    this.midpoints = loopifyInPairs(points).map(([start, end]) =>
      midpoint(start, end)
    );

    const calculatedPoints: Point[] = [];
    loopifyInPairs(points).map(([start, end]) => {
      const halfLength = distance(start, end) / 2;
      for (let i = 30; i < halfLength; i += 30) {
        calculatedPoints.push(pointOnLine(i)(start, end));
      }
      for (let i = 30; i < halfLength; i += 30) {
        calculatedPoints.push(pointOnLine(i)(end, start));
      }
    });
    this.subPoints = calculatedPoints;
  }
}

export default Wren;
