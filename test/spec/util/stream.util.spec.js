import flow from "lodash/fp/flow";
import constant from "lodash/fp/constant";
import map from "lodash/fp/map";
import join from "lodash/fp/join";
import identity from "lodash/fp/identity";

import { stringStream } from "/src/util/stream.util";

describe("util / stream.util", () => {
  describe("stringStream.mapToken", () => {
    it("should map 0-length tokens", () => {
      const stream = stringStream("test");
      const tokens = stream.mapToken(constant(null), constant("1"));

      expect(tokens.join("")).to.eq("");
      expect(stream.remainingLength()).to.eq(0);
    });

    it("should map 1-length tokens", () => {
      const tokenizer = (string, index) => string[index];
      const stream = stringStream("test");
      const tokens = stream.mapToken(tokenizer, constant("1"));

      expect(tokens.join("")).to.eq("1111");
      expect(stream.remainingLength()).to.eq(0);
    });

    it("should map >1-length tokens", () => {
      const tokenizer = (string, index) => {
        if (
          string[index] === "o" &&
          string[index + 1] === "n" &&
          string[index + 2] === "e"
        ) {
          return "111";
        } else if (
          string[index] === "t" &&
          string[index + 1] === "w" &&
          string[index + 2] === "o"
        ) {
          return "222";
        } else {
          return string[index];
        }
      };

      const stream = stringStream("zero one two");
      const tokens = stream.mapToken(tokenizer, identity);

      expect(tokens.join("")).to.eq("zero 111 222");
      expect(stream.remainingLength()).to.eq(0);
    });
  });

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

    it("should provide character and index to iterators", () => {
      const stream = stringStream("a `bb`");

      let nonMatchArgs = [];
      let matchArgs = [];

      while (stream.hasMore()) {
        stream.mapRegExp(
          new RegExp("`[^`]*`"),
          (character, index) => {
            nonMatchArgs = [...nonMatchArgs, [character, index]];
          },
          (character, index) => {
            matchArgs = [...matchArgs, [character, index]];
          }
        );
      }

      const serialize = flow([map(join(",")), join("|")]);
      expect(serialize(nonMatchArgs)).to.eq("a,0| ,1");
      expect(serialize(matchArgs)).to.eq("`,0|b,1|b,2|`,3");
    });
  });
});
