import rule from "/src/gfm.parser/rule/block/thematic-break.rule";

import {
  PASS,
  FAIL,
  testBlockAcceptance,
  testBlockProperties
} from "/test/util/parser.util";

describe("gfm.parser / rule / block / thematic-break.rule", () => {
  testBlockAcceptance(rule)([
    [FAIL, "-"],
    [FAIL, "--"],
    [PASS, "---"],
    [PASS, " ---"],
    [PASS, "  ---"],
    [PASS, "   ---"],
    [FAIL, "    ---"],
    [PASS, "--- "],
    [PASS, "- - - "],
    [PASS, " - - -"],
    [PASS, " - - - "],
    [FAIL, "_"],
    [FAIL, "__"],
    [PASS, "___"],
    [PASS, " ___"],
    [PASS, "  ___"],
    [PASS, "   ___"],
    [FAIL, "    ___"],
    [PASS, "___ "],
    [PASS, "_ _ _ "],
    [PASS, " _ _ _"],
    [PASS, " _ _ _ "],
    [FAIL, "*"],
    [FAIL, "**"],
    [PASS, "***"],
    [PASS, " ***"],
    [PASS, "  ***"],
    [PASS, "   ***"],
    [FAIL, "    ***"],
    [PASS, "*** "],
    [PASS, "* * * "],
    [PASS, " * * *"],
    [PASS, " * * * "],
    [FAIL, "-*_"]
  ]);

  testBlockProperties(rule)([
    ["lineType", "thematic-break-line", "---"],
    ["lineContext.raw", "---", "---"],
    ["lineContext.raw", " ___", " ___"],
    ["lineContext.raw", "*** ", "*** "]
  ]);

  testBlockProperties(
    rule,
    "lineContext.thematicBreak"
  )([
    ["text", "---", "---"],
    ["text", "---", " ---"],
    ["text", "---", "--- "],
    ["text", "---", " --- "],
    ["text", "___", "___"],
    ["text", "___", " ___"],
    ["text", "___", "___ "],
    ["text", "___", " ___ "],
    ["text", "***", "***"],
    ["text", "***", " ***"],
    ["text", "***", "*** "],
    ["text", "***", " *** "],
    ["text", "- - -", "- - -"],
    ["text", "_ _ _", " _ _ _"],
    ["text", "* * *", "* * * "],
    ["prefix", "", "---"],
    ["prefix", " ", " ---"],
    ["prefix", "  ", "  ---"],
    ["prefix", "   ", "   * * *"],
    ["suffix", "", "___"],
    ["suffix", " ", "___ "],
    ["suffix", "  ", "___  "],
    ["suffix", "   ", "* * *   "]
  ]);
});
