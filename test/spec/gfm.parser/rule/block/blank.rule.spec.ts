import rule from "/src/gfm.parser/rule/block/blank.rule";

import {
  PASS,
  FAIL,
  testAcceptance,
  testProperties
} from "/test/util/parser.util";

describe("gfm.parser / rule / block / blank.rule", () => {
  testAcceptance(rule)([
    [FAIL, ""],
    [PASS, "   "]
  ]);

  testProperties(rule)([
    ["lineType", "blank-line", " "],
    ["lineContext.raw", " ", " "]
  ]);
});
