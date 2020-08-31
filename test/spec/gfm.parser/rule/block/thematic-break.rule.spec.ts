import rule from "/src/gfm.parser/rule/block/thematic-break.rule";

import { PASS, FAIL, testBlockAcceptance } from "/test/util/parser.util";

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
});
