import rule from "/src/gfm.parser/rule/block/empty.rule";

import { PASS, FAIL, testBlockAcceptance } from "/test/util/parser.util";

describe("gfm.parser / rule / block / empty.rule", () => {
  testBlockAcceptance(rule)([
    [FAIL, "   "],
    [PASS, ""]
  ]);
});
