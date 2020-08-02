import atxHeadingRule from "/src/gfm.parser/rule/block/atx-heading.rule";
import rule from "/src/gfm.parser/rule/inline/block-syntax.rule";

import { adaptLines } from "/test/util/parser.util";

describe("gfm.parser / rule / inline / block-syntax.rule", () => {
  it("should do something", () => {
    const line = adaptLines("  ### Heading Level 3 ##  ");

    const {
      lineType,
      lineContext,
      lineContext: { raw }
    } = atxHeadingRule.parse(line);

    const tokens = rule.parse({ lineType, lineContext });

    expect(tokens).to.have.length(raw.length);
  });
});
