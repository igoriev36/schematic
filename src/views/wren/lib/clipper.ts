const Shape = require("clipper-js").default;

const multiplier = 1e6;
function toClipper(p) {
  return { X: p[0] * multiplier, Y: p[1] * multiplier };
}
function fromClipper(c) {
  return [c.X / multiplier, c.Y / multiplier];
}

export const offset = (
  POINTS,
  {
    DELTA = -1,
    JOINT_TYPE = "jtMiter",
    END_TYPE = "etClosedPolygon",
    MITER_LIMIT = Infinity,
    ROUND_PRECISION = 0
  }
) => {
  const newPoints = POINTS.map(toClipper);

  const subject = new Shape([newPoints], true);
  const newShape = subject.offset(DELTA * multiplier, {
    jointType: JOINT_TYPE,
    endType: END_TYPE,
    miterLimit: MITER_LIMIT,
    roundPrecision: ROUND_PRECISION
  });

  const outPath = newShape.paths[0] || [];
  const OFFSET_POINTS = outPath.map(fromClipper);

  return OFFSET_POINTS;
};
