import { Point, midpoint } from "./point";
import { loopifyInPairs } from "./list";

class Wren {
  points: Point[];
  midpoints: Point[];

  constructor(points) {
    this.points = points;
    this.midpoints = loopifyInPairs(points).map(([start, end]) =>
      midpoint(start, end)
    );
  }
}

export default Wren;
