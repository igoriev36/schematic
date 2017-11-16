type Point = [number, number];

// top left is 0,0

export const basePoints = [[0, 5], [5, 10], [5, 20], [-5, 20], [-5, 10]];

function Wren(points: Point[]): Point[] {
  return [[0, 0]];
}

export default Wren;
