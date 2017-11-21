import { pointOnLine, distance, Point } from "./point";

it("calculates point on line", () => {
  const points: Point[] = [[0, 0], [10, 10]];
  const result = [1.414213562373095, 1.414213562373095];
  expect(pointOnLine(...points)(2)).toEqual(result);
});

it("calculates distance between 2 points", () => {
  const points: Point[] = [[-10, -10], [10, 10]];
  expect(distance(...points)).toEqual(28.284271247461902);
});
