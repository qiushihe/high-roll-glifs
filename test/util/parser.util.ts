import flow from "lodash/fp/flow";
import forEach from "lodash/fp/forEach";
import split from "lodash/fp/split";
import first from "lodash/fp/first";
import isEmpty from "lodash/fp/isEmpty";

import { AdaptedStream } from "/src/gfm.parser/stream/adapter";
import { ParserState } from "/src/gfm.parser/parser/parser";
import { BlockRule } from "/src/gfm.parser/rule/block/rule";
import constant from "lodash/fp/constant";

export const PASS = true;
export const FAIL = false;

export const adaptLines = (rawText: string): AdaptedStream => {
  const lines = split("\n")(rawText);

  const text = constant(lines[0]);

  const ended = constant(lines.length <= 0);

  const match = (pattern: RegExp): RegExpMatchArray | null =>
    flow([first, (line) => line.match(pattern)])(lines);

  const slice = (from: number) => adaptLines(lines.slice(from).join("\n"));

  return { text, ended, match, slice };
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
        expect(result).to.not.be.empty;
      });
    } else {
      it(`should not accept ${JSON.stringify(
        input
      )}${stateDescription}`, () => {
        expect(result).to.be.empty;
      });
    }
  })(expectations);
};
