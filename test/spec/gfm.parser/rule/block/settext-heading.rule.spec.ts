import rule from "/src/gfm.parser/rule/block/settext-heading.rule";

import { PASS, FAIL, testBlockAcceptance } from "/test/util/parser.util";

describe("gfm.parser / rule / block / settext-heading.rule", () => {
  testBlockAcceptance(rule)([
    [FAIL, "line"],
    [FAIL, "="],
    [FAIL, "-"],
    [PASS, "heading 1\n="],
    [PASS, "heading 2\n-"]
  ]);
});
