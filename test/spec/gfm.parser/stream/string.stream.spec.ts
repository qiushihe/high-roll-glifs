import flow from "lodash/fp/flow";
import constant from "lodash/fp/constant";
import map from "lodash/fp/map";
import join from "lodash/fp/join";
import flatten from "lodash/fp/flatten";

import { stringStream } from "/src/gfm.parser/stream/string.stream";

describe("gfm.parser / stream / string.stream", () => {
  describe("mapToken", () => {
    it("should map 0-length tokens", () => {
      const stream = stringStream("test");
      const tokens = stream.mapToken(constant(null));

      expect(tokens).to.have.length(4);
      expect(tokens[0]).to.have.length(0);
      expect(tokens[1]).to.have.length(0);
      expect(tokens[2]).to.have.length(0);
      expect(tokens[3]).to.have.length(0);
      expect(stream.remainingLength()).to.eq(0);
    });

    it("should map 1-length tokens", () => {
      const stream = stringStream("test");
      const tokens = stream.mapToken(constant([1, ["One"]]));

      expect(flow([flatten, join("")])(tokens)).to.eq("OneOneOneOne");
      expect(stream.remainingLength()).to.eq(0);
    });

    it("should map >1-length tokens", () => {
      const tokenizer = (string: string, index: number): [number, string[]] => {
        if (
          string[index] === "o" &&
          string[index + 1] === "n" &&
          string[index + 2] === "e"
        ) {
          return [3, ["<1>"]];
        } else if (
          string[index] === "t" &&
          string[index + 1] === "h" &&
          string[index + 2] === "r" &&
          string[index + 3] === "e" &&
          string[index + 4] === "e"
        ) {
          return [5, ["<3>"]];
        } else {
          return [1, [string[index]]];
        }
      };

      const stream = stringStream("zero one two three");
      const tokens = stream.mapToken(tokenizer);

      expect(flow([flatten, join("")])(tokens)).to.eq(
        "zero <1><1><1> two <3><3><3><3><3>"
      );
      expect(stream.remainingLength()).to.eq(0);
    });
  });

  describe("mapRegExp", () => {
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
        constant(["1"]),
        constant(["2"])
      );

      expect(flow([flatten, join("")])(tokens)).to.eq("1111111111111111");
      expect(stream.remainingLength()).to.eq(0);
    });

    it("should map up to the end of the matched string", () => {
      const stream = stringStream("this `test` string");
      const tokens = stream.mapRegExp(
        new RegExp("`[^`]*`"),
        constant(["1"]),
        constant(["2"])
      );

      expect(flow([flatten, join("")])(tokens)).to.eq("11111222222");
      expect(stream.remainingLength()).to.eq(7);
    });

    it("should map up to the end of the matched string consecutively", () => {
      const stream = stringStream("1 `22` 333 `4444`");
      const tokens = stream.mapAllRegExp(
        new RegExp("`[^`]*`"),
        constant(["1"]),
        constant(["2"])
      );

      expect(flow([flatten, join("")])(tokens)).to.eq("11222211111222222");
      expect(stream.remainingLength()).to.eq(0);
    });

    it("should provide character and index to iterators", () => {
      const stream = stringStream("a `bb`");

      let nonMatchArgs: [string, number][] = [];
      let matchArgs: [string, number][] = [];

      while (stream.hasMore()) {
        stream.mapRegExp(
          new RegExp("`[^`]*`"),
          (character, index) => {
            nonMatchArgs = [...nonMatchArgs, [character, index]];
            return [];
          },
          (character, index) => {
            matchArgs = [...matchArgs, [character, index]];
            return [];
          }
        );
      }

      const serialize = flow([map(join(",")), join("|")]);
      expect(serialize(nonMatchArgs)).to.eq("a,0| ,1");
      expect(serialize(matchArgs)).to.eq("`,0|b,1|b,2|`,3");
    });
  });
});
