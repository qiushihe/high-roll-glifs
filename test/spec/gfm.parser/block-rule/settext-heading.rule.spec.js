import rule from "/src/gfm.parser/block-rule/settext-heading.rule";

import { PASS, FAIL, testAcceptance } from "/test/util/parser.util";

describe("gfm.parser / block-rule / settext-heading.rule", () => {
  testAcceptance(rule)([
    [FAIL, "line"],
    [FAIL, "="],
    [FAIL, "-"],
    [PASS, "heading 1\n="],
    [PASS, "heading 2\n-"],
    [PASS, "=", { previousLines: [{ raw: "heading 1" }] }],
    [PASS, "-", { previousLines: [{ raw: "heading 2" }] }]
  ]);
});
