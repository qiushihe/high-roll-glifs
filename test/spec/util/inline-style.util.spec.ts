import { recombobulator } from "/src/gfm.parser/parser/inline.parser";

describe("util / inline-style.util", () => {
  describe("recombobulator", () => {
    it("should return layer with same length as given line length", () => {
      const layer = recombobulator(10, {})([]);
      expect(layer).to.have.length(10);
    });

    it("should accept code-span over link-span", () => {
      const layer = recombobulator(5, { "code-span": ["link-span"] })([
        [[], ["code-span"], ["code-span"], ["code-span"], []],
        [["link-span"], ["link-span"], ["link-span"], [], []]
      ]);

      expect(layer).to.have.length(5);
    });
  });
});
