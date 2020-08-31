import rule from "/src/gfm.parser/rule/block/atx-heading.rule";

import { PASS, FAIL, testBlockAcceptance } from "/test/util/parser.util";

describe("gfm.parser / rule / block / atx-heading.rule", () => {
  testBlockAcceptance(rule)([
    [FAIL, "line"],
    [FAIL, "#line"],
    [PASS, "# heading 1"],
    [PASS, "## heading 2"],
    [PASS, "### heading 3"],
    [PASS, "#### heading 4"],
    [PASS, "##### heading 5"],
    [PASS, "###### heading 6"],
    [FAIL, "####### heading 7"],
    [PASS, " ##### heading 5"],
    [PASS, "  #### heading 4"],
    [PASS, "   ### heading 3"],
    [FAIL, "    ## heading 2"],
    [FAIL, "     # heading 1"],
    [PASS, "#"],
    [PASS, "##"],
    [PASS, "###"],
    [PASS, "####"],
    [PASS, "#####"],
    [PASS, "######"],
    [FAIL, "#######"],
    [PASS, " #####"],
    [PASS, "  ####"],
    [PASS, "   ###"],
    [FAIL, "    ##"],
    [FAIL, "     #"]
  ]);
});
