import rule from "/src/gfm.parser/block-rule/atx-heading.rule";

import { PASS, FAIL, testAcceptance } from "/test/util/parser.util";

describe("gfm.parser / block-rule / atx-heading.rule", () => {
  testAcceptance(rule)([
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
