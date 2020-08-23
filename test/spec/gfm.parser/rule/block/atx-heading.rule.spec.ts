import rule from "/src/gfm.parser/rule/block/atx-heading.rule";

import {
  PASS,
  FAIL,
  testBlockAcceptance,
  testBlockProperties,
} from "/test/util/parser.util";

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
    [FAIL, "     #"],
  ]);

  testBlockProperties(rule)([
    ["lineType", "atx-heading-line", "# Heading"],
    ["lineContext.raw", "# Heading", "# Heading"],
    ["lineContext.raw", " # Heading", " # Heading"],
    ["lineContext.raw", "# Heading ", "# Heading "],
  ]);

  testBlockProperties(
    rule,
    "lineContext.atxHeading"
  )([
    ["level", 3, "### Heading 3"],
    ["text", "Heading 3", "### Heading 3"],
    ["text", "Heading 3 ", "### Heading 3 "],
    ["text", "Heading 3  ", "### Heading 3  "],
    ["prefix", "", "### Heading"],
    ["prefix", " ", " ### Heading"],
    ["prefix", "  ", "  ### Heading"],
    ["suffix", "", "### Heading "],
    ["suffix", "", "### Heading  "],
    ["suffix", "", "### Heading#"],
    ["suffix", " #", "### Heading #"],
    ["suffix", "  #", "### Heading  #"],
    ["suffix", "  ##", "### Heading  ##"],
    ["suffix", "  ## ", "### Heading  ## "],
    ["suffix", "  ##  ", "### Heading  ##  "],
  ]);
});
