export type Point = [number, number];

const _getXY = (start: Point, end: Point): Point => [
  end[0] - start[0],
  end[1] - start[1]
];

/**
 * Returns a point at an absolute distance between two points.
 */
export const pointOnLine = (distance: number) => (
  start?: Point,
  end?: Point
): Point => {
  const [x, y] = _getXY(start, end);
  const hypot = Math.hypot(x, y);
  return [x / hypot * distance, y / hypot * distance];
};

/**
 * Calculates the straight-line distance between two points
 */
export const distance = (start?: Point, end?: Point): number => {
  const [x, y] = _getXY(start, end);
  return Math.hypot(x, y);
};

/**
 * Calculates the point at a % distance between two points
 * @returns {Array}
 */
const percentageOnLine = (percentage = 0.5) => (
  start?: Point,
  end?: Point
): Point => {
  const [x, y] = _getXY(start, end);
  return [start[0] + x * percentage, start[1] + y * percentage];
};

/**
 * Calculates the point between two points
 * @returns {Array}
 */
export const midpoint = percentageOnLine(0.5);
