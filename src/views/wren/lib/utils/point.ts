export type Point = [number, number];

const _getXY = (start: Point, end: Point): Point => [
  end[0] - start[0],
  end[1] - start[1]
];

/**
 * Returns a point at an absolute distance between two points.
 */
export const pointOnLine = (start?: Point, end?: Point) => (
  distance: number
): Point => {
  const [x, y] = _getXY(start, end);
  const hypot = Math.hypot(x, y);
  return [start[0] + x / hypot * distance, start[1] + y / hypot * distance];
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
export const percentageOnLine = (percentage = 0.5) => (
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

export const angle = (start?: Point, end?: Point): number => {
  const [x, y] = _getXY(start, end);
  return Math.atan2(y, x);
};

/**
 * Rotates a point rotated around a given axis point (in radians)
 */
export const rotateAroundPoint = ([originX, originY]: Point, angle = 0) => (
  [pointX, pointY]: Point
): Point => {
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  return [
    cosAngle * (pointX - originX) - sinAngle * (pointY - originY) + originX,
    sinAngle * (pointX - originX) + cosAngle * (pointY - originY) + originY
  ];
};

export function bounds(
  points
): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  offsetX: number;
  offsetY: number;
} {
  const b = points.reduce(
    (o, v) => {
      if (v[0] < o.minX) o.minX = v[0];
      if (v[0] > o.maxX) o.maxX = v[0];
      if (v[1] < o.minY) o.minY = v[1];
      if (v[1] > o.maxY) o.maxY = v[1];
      return o;
    },
    {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity
    }
  );

  b.offsetX = b.minX + (b.maxX - b.minX) / 2;
  b.offsetY = b.minY + (b.maxY - b.minY) / 2;

  return b;
}
