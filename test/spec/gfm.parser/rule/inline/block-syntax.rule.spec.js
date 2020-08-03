import atxHeadingRule from "/src/gfm.parser/rule/block/atx-heading.rule";
import rule from "/src/gfm.parser/rule/inline/block-token.rule";

import { adaptLines } from "/test/util/parser.util";

describe("gfm.parser / rule / inline / block-syntax.rule", () => {
  // TODO: Finish this test
  it("should do something", () => {
    const line = adaptLines("  ### Heading Level 3 ##  ");

    const {
      lineType,
      lineContext,
      lineContext: { raw }
    } = atxHeadingRule.parse(line);

    const { inlineTokens } = rule.parse(
      { type: lineType, ...lineContext },
      {},
      line
    );

    expect(inlineTokens).to.have.length(raw.length);
  });
});
