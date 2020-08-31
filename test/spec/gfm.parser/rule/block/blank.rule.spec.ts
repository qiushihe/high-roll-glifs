import rule from "/src/gfm.parser/rule/block/blank.rule";

import { PASS, FAIL, testBlockAcceptance } from "/test/util/parser.util";

describe("gfm.parser / rule / block / blank.rule", () => {
  testBlockAcceptance(rule)([
    [FAIL, ""],
    [PASS, "   "]
  ]);
});
