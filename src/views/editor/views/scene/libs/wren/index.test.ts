import Wren from ".";

describe("Basic test", () => {
  it("works", () => {
    expect(Wren([[0, 0]])).toEqual([[0, 0]]);
  });
});
