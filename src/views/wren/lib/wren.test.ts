import Wren from "./wren";
import { Point } from "./point";

it("calculates midpoints", () => {
  const points: Point[] = [[0, 0], [2, 2], [0, 1]];
  const result = [[1, 1], [1, 1.5], [0, 0.5]];
  expect(new Wren(points).midpoints).toEqual(result);
});
