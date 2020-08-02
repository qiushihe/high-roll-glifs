import rule from "/src/gfm.parser/rule/block/settext-heading.rule";

import {
  PASS,
  FAIL,
  testAcceptance,
  testProperties
} from "/test/util/parser.util";

describe("gfm.parser / rule / block / settext-heading.rule", () => {
  testAcceptance(rule)([
    [FAIL, "line"],
    [FAIL, "="],
    [FAIL, "-"],
    [PASS, "heading 1\n="],
    [PASS, "heading 2\n-"],
    [PASS, "=", { previousLines: [{ raw: "heading 1" }] }],
    [PASS, "-", { previousLines: [{ raw: "heading 2" }] }]
  ]);

  testProperties(rule)([
    ["lineType", "settext-heading-line", "heading 1\n="],
    ["lineContext.raw", "heading 1 ", "heading 1 \n="],
    ["lineContext.raw", " =", " =", { previousLines: [{ raw: "heading 1" }] }]
  ]);

  testProperties(
    rule,
    "lineContext.settextHeading"
  )([
    ["level", 1, "heading 1\n="],
    ["level", 2, "heading 2\n-"],
    ["level", 1, "=", { previousLines: [{ raw: "heading 1" }] }],
    ["level", 2, "-", { previousLines: [{ raw: "heading 2" }] }],
    ["isUnderline", false, "heading 1\n="],
    ["isUnderline", false, "heading 2\n-"],
    ["isUnderline", true, "=", { previousLines: [{ raw: "heading 1" }] }],
    ["isUnderline", true, "-", { previousLines: [{ raw: "heading 2" }] }],
    ["prefix", "", "heading 1\n="],
    ["prefix", " ", " heading 1\n="],
    ["prefix", "  ", "  heading 2\n-"],
    ["prefix", "   ", "   heading 2\n-"],
    ["suffix", "", "heading 1\n="],
    ["suffix", " ", "heading 1 \n="],
    ["suffix", "  ", "heading 2  \n-"],
    ["suffix", "   ", "heading 2   \n-"],
    ["text", "heading 1", " heading 1  \n="],
    ["text", "heading 2", "  heading 2 \n-"],
    ["prefix", "", "=", { previousLines: [{ raw: "heading 1" }] }],
    ["prefix", " ", " =", { previousLines: [{ raw: "heading 1" }] }],
    ["prefix", "  ", "  -", { previousLines: [{ raw: "heading 2" }] }],
    ["prefix", "   ", "   -", { previousLines: [{ raw: "heading 2" }] }],
    ["suffix", "", "=", { previousLines: [{ raw: "heading 1" }] }],
    ["suffix", " ", "= ", { previousLines: [{ raw: "heading 1" }] }],
    ["suffix", "  ", "-  ", { previousLines: [{ raw: "heading 2" }] }],
    ["suffix", "   ", "-   ", { previousLines: [{ raw: "heading 2" }] }],
    ["text", "===", " ===  ", { previousLines: [{ raw: "heading 1" }] }],
    ["text", "---", "  --- ", { previousLines: [{ raw: "heading 2" }] }]
  ]);
});
