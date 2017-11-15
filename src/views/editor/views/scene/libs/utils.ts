export function getPosition(
  x: number,
  y: number,
  width: number,
  height: number
): [number, number] {
  return [x / width * 2 - 1, -(y / height) * 2 + 1];
}
