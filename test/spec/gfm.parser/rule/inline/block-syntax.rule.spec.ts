import atxHeadingRule from "/src/gfm.parser/rule/block/atx-heading.rule";
import rule from "/src/gfm.parser/rule/inline/block-token.rule";

import { adaptLines } from "/test/util/parser.util";

describe("gfm.parser / rule / inline / block-syntax.rule", () => {
  it("should return same number of tokens as input string length", () => {
    const line = adaptLines("  ### Heading Level 3 ##  ");

    const blockResult = atxHeadingRule.parse(line, {});

    if (!blockResult) {
      throw new Error("failed to parse block rule");
    }

    const {
      lineType,
      lineContext,
      lineContext: { raw }
    } = blockResult;

    const inlineResult = rule.parse(
      {
        type: lineType,
        context: lineContext,
        inline: { tokens: [], context: {} }
      },
      {},
      line
    );

    if (!inlineResult) {
      throw new Error("failed to parse inline rule");
    }

    const { inlineTokens } = inlineResult;

    expect(inlineTokens).to.have.length(raw.length);
  });
});
