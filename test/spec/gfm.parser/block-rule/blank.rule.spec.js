import rule from "/src/gfm.parser/block-rule/blank.rule";

import { PASS, FAIL, testAcceptance } from "/test/util/parser.util";

describe("gfm.parser / block-rule / blank.rule", () => {
  testAcceptance(rule)([
    [FAIL, ""],
    [PASS, "   "]
  ]);
});
