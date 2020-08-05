import flow from "lodash/fp/flow";
import constant from "lodash/fp/constant";
import map from "lodash/fp/map";
import join from "lodash/fp/join";

import { stringStream } from "/src/util/stream.util";

describe("util / stream.util", () => {
  describe("stringStream.mapRegExp", () => {
    it("should report empty string's remaining length", () => {
      expect(stringStream("").remainingLength()).to.eq(0);
    });

    it("should report untouched string's remaining length", () => {
      expect(stringStream("test").remainingLength()).to.eq(4);
    });

    it("should map entire string if there is no match for the given expression", () => {
      const stream = stringStream("this test string");
      const tokens = stream.mapRegExp(
        new RegExp("`[^`]*`"),
        constant("1"),
        constant("2")
      );

      expect(tokens.join("")).to.eq("1111111111111111");
      expect(stream.remainingLength()).to.eq(0);
    });

    it("should map up to the end of the matched string", () => {
      const stream = stringStream("this `test` string");
      const tokens = stream.mapRegExp(
        new RegExp("`[^`]*`"),
        constant("1"),
        constant("2")
      );

      expect(tokens.join("")).to.eq("11111222222");
      expect(stream.remainingLength()).to.eq(7);
    });

    it("should map up to the end of the matched string consecutively", () => {
      const stream = stringStream("1 `22` 333 `4444`");
      const tokens = stream.mapAllRegExp(
        new RegExp("`[^`]*`"),
        constant("1"),
        constant("2")
      );

      expect(tokens.join("")).to.eq("11222211111222222");
      expect(stream.remainingLength()).to.eq(0);
    });

    it("should provide character, index and string to iterators", () => {
      const stream = stringStream("a `bb`");

      let nonMatchArgs = [];
      let matchArgs = [];

      while (stream.hasMore()) {
        stream.mapRegExp(
          new RegExp("`[^`]*`"),
          (...args) => {
            nonMatchArgs = [...nonMatchArgs, args];
          },
          (...args) => {
            matchArgs = [...matchArgs, args];
          }
        );
      }

      const serialize = flow([map(join(",")), join("|")]);
      expect(serialize(nonMatchArgs)).to.eq("a,0,a `bb`| ,1,a `bb`");
      expect(serialize(matchArgs)).to.eq("`,0,`bb`|b,1,`bb`|b,2,`bb`|`,3,`bb`");
    });
  });
});
