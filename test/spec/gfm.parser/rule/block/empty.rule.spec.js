import rule from "/src/gfm.parser/rule/block/empty.rule";

import {
  PASS,
  FAIL,
  testAcceptance,
  testProperties
} from "/test/util/parser.util";

describe("gfm.parser / rule / block / empty.rule", () => {
  testAcceptance(rule)([
    [FAIL, "   "],
    [PASS, ""]
  ]);

  testProperties(rule)([
    ["lineType", "empty-line", ""],
    ["lineContext.raw", "", ""]
  ]);
});
