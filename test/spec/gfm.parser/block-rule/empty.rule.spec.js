import rule from "/src/gfm.parser/block-rule/empty.rule";

import { PASS, FAIL, testAcceptance } from "/test/util/parser.util";

describe("gfm.parser / block-rule / empty.rule", () => {
  testAcceptance(rule)([
    [FAIL, "   "],
    [PASS, ""]
  ]);
});
