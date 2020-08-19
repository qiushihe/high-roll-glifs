import flow from "lodash/fp/flow";
import forEach from "lodash/fp/forEach";
import split from "lodash/fp/split";
import first from "lodash/fp/first";
import isEmpty from "lodash/fp/isEmpty";
import compact from "lodash/fp/compact";
import join from "lodash/fp/join";

import { AdaptedStream } from "/src/gfm.parser/stream/adapter";
import { ParserState } from "/src/gfm.parser/parser";
import { BlockRule } from "/src/gfm.parser/rule/block/rule";

export const PASS = true;
export const FAIL = false;

export const adaptLines = (text: string): AdaptedStream => {
  const lines = split("\n")(text);

  const match = (pattern: RegExp): RegExpMatchArray | null =>
    flow([first, line => line.match(pattern)])(lines);

  const lookAhead = (index: number): string | null => lines[index];

  return { match, lookAhead };
};

export const testBlockAcceptance = (rule: BlockRule) => (
  expectations: [boolean, string, ParserState?][]
): void => {
  forEach(([shouldPass, input, state = {}]) => {
    const result = rule.parse(adaptLines(input), state);
    const stateDescription = isEmpty(state)
      ? ""
      : ` with ${JSON.stringify(state)}`;

    if (shouldPass) {
      it(`should accept ${JSON.stringify(input)}${stateDescription}`, () => {
        expect(result).to.not.be.null;
      });
    } else {
      it(`should not accept ${JSON.stringify(
        input
      )}${stateDescription}`, () => {
        expect(result).to.be.null;
      });
    }
  })(expectations);
};

export const testBlockProperties = (rule: BlockRule, prefix = "") => (
  expectations: [string, unknown, string, ParserState?][]
): void => {
  const description = isEmpty(prefix)
    ? "result attributes"
    : `result ${prefix}.* attributes`;

  describe(description, () => {
    forEach(([name, expected, input, state = {}]) => {
      it(`${JSON.stringify(input)} should produce \`${name}\`: ${JSON.stringify(
        expected
      )}`, () => {
        expect(rule.parse(adaptLines(input), state)).to.have.nested.property(
          flow([compact, join(".")])([prefix, name]),
          expected
        );
      });
    })(expectations);
  });
};
