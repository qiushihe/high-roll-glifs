import rule from "/src/gfm.parser/block-rule/blank.rule";

import {
  PASS,
  FAIL,
  testAcceptance,
  testProperties
} from "/test/util/parser.util";

describe("gfm.parser / block-rule / blank.rule", () => {
  testAcceptance(rule)([
    [FAIL, ""],
    [PASS, "   "]
  ]);

  testProperties(rule)([
    ["lineType", "blank-line", " "],
    ["lineContext.raw", " ", " "]
  ]);
});
