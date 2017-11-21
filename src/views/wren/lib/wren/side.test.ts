import Side from "./side";

it("should work", () => {
  const side = new Side([0, 0], [100, 0]);
  expect(side).toEqual({
    pieces: [
      {
        pos: { x: 0, y: 0, z: 0 },
        pts: [[0, 0], [100, 0], [100, 1200], [0, 1200]],
        rot: { o: "ZYX", x: 0, y: 0, z: 1.5707963267948966 }
      }
    ]
  });
});
