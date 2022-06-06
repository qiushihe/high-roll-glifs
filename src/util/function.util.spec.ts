import { invoke } from "./function.util";

describe("util / function.util", () => {
  describe("invoke", () => {
    it("should invoke the provided function", () => {
      expect(invoke(() => 42)).toBe(42);
    });
  });
});
