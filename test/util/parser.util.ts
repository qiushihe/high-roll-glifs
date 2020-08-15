import flow from "lodash/fp/flow";
import forEach from "lodash/fp/forEach";
import split from "lodash/fp/split";
import first from "lodash/fp/first";
import isEmpty from "lodash/fp/isEmpty";
import compact from "lodash/fp/compact";
import join from "lodash/fp/join";
import get from "lodash/fp/get";
import map from "lodash/fp/map";

import { sameItemsAs } from "/src/util/array.util";

import {
  AdaptedStream,
  BlockRule,
  InlineRule,
  ParsedInline,
  ParserState
} from "/src/gfm.parser/type";

export const PASS = true;
export const FAIL = false;

export const adaptLines = (text: string): AdaptedStream => {
  const lines = split("\n")(text);

  const match = (pattern: RegExp): RegExpMatchArray | null =>
    flow([first, line => line.match(pattern)])(lines);

  const lookAhead = (index: number): string | null => lines[index];

  return { match, lookAhead };
};

export const testAcceptance = (rule: BlockRule) => (
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

export const testProperties = (rule: BlockRule, prefix = "") => (
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

type OutputGetter = (input: ParsedInline | null) => unknown;

export const testOutput = (rule: InlineRule, getOutput: OutputGetter) => (
  expectations: [string, unknown][]
): void => {
  forEach(([input, output]) => {
    it(`should correctly parse ${JSON.stringify(input)}`, () => {
      expect(
        getOutput(
          rule.parse(
            {
              type: "paragraph-line",
              context: { raw: input },
              inline: { tokens: [], context: {} }
            },
            {},
            adaptLines(input)
          )
        )
      ).to.eq(output);
    });
  })(expectations);
};

export const mapInlineTokens = (
  tokenMappings: [string[], string][],
  emptyString = "x",
  separator = ""
): OutputGetter => {
  return flow([
    get("inlineTokens"),
    map((tokens: string[]) => {
      if (isEmpty(tokens)) {
        return emptyString;
      } else {
        for (let i = 0; i < tokenMappings.length; i++) {
          const mapping = tokenMappings[i] as [string[], string];
          const referenceItems = mapping[0];
          const mappedString = mapping[1];

          if (sameItemsAs(referenceItems)(tokens)) {
            return mappedString;
          }
        }
        return emptyString;
      }
    }),
    join(separator)
  ]);
};
