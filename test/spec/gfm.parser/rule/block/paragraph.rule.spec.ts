import rule from "/src/gfm.parser/rule/block/paragraph.rule";

import {
  PASS,
  FAIL,
  testBlockAcceptance,
  testBlockProperties
} from "/test/util/parser.util";

describe("gfm.parser / rule / block / paragraph.rule", () => {
  testBlockAcceptance(rule)([
    [FAIL, ""],
    [PASS, "word"],
    [PASS, "another word"],
    [PASS, "      some more words"],
    [PASS, "some more words      "],
    [PASS, "      some more words      "]
  ]);

  testBlockProperties(rule)([
    ["lineType", "paragraph-line", "a paragraph line"],
    [
      "lineContext.raw",
      "   a paragraph line      ",
      "   a paragraph line      "
    ]
  ]);
});
