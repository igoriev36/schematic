import data from "./data";

describe("reducers", () => {
  describe("data", () => {
    it("provides the initial state", () => {
      expect(data(undefined, {})).toEqual({ count: 0 });
    });
    it("handles INCREMENT action", () => {
      expect(data({}, { type: "INCREMENT" })).toEqual({ count: 2 });
    });
    it("handles INCREMENT action", () => {
      expect(data({ count: 1 }, { type: "INCREMENT" })).toEqual({ count: 2 });
    });
    it("handles DECREMENT action", () => {
      expect(data({ count: 1 }, { type: "DECREMENT" })).toEqual({ count: 0 });
    });
    // it("ignores unkown actions", () => {
    //   expect(data({ count: 1 }, { type: "unknown" })).toEqual({ count: 1 });
    // });
  });
});
