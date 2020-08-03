import { getFromMany } from "/src/util/function.util";

describe("util / function.util", () => {
  describe("getFromMany", () => {
    it("should return value from first object when available", () => {
      expect(
        getFromMany("name.first")(
          { name: { first: "lala1" } },
          { name: { first: "lala2" } }
        )
      ).to.equal("lala1");
    });

    it("should return value from second object when not available in first object", () => {
      expect(
        getFromMany("name.last")(
          { name: { first: "lala1" } },
          { name: { last: "lala2" } }
        )
      ).to.equal("lala2");
    });
  });
});
