import rule from "/src/gfm.parser/rule/block/settext-heading.rule";

import { LineState } from "/src/gfm.parser/type";

import {
  PASS,
  FAIL,
  testAcceptance,
  testProperties
} from "/test/util/parser.util";

const ctx = (raw: string): LineState => ({
  type: "settext-heading-line",
  context: { raw },
  inline: { tokens: [], context: {} }
});

describe("gfm.parser / rule / block / settext-heading.rule", () => {
  testAcceptance(rule)([
    [FAIL, "line"],
    [FAIL, "="],
    [FAIL, "-"],
    [PASS, "heading 1\n="],
    [PASS, "heading 2\n-"],
    [PASS, "=", { previousLines: [ctx("heading 1")] }],
    [PASS, "-", { previousLines: [ctx("heading 2")] }]
  ]);

  testProperties(rule)([
    ["lineType", "settext-heading-line", "heading 1\n="],
    ["lineContext.raw", "heading 1 ", "heading 1 \n="],
    ["lineContext.raw", " =", " =", { previousLines: [ctx("heading 1")] }]
  ]);

  testProperties(
    rule,
    "lineContext.settextHeading"
  )([
    ["level", 1, "heading 1\n="],
    ["level", 2, "heading 2\n-"],
    ["level", 1, "=", { previousLines: [ctx("heading 1")] }],
    ["level", 2, "-", { previousLines: [ctx("heading 2")] }],
    ["isUnderline", false, "heading 1\n="],
    ["isUnderline", false, "heading 2\n-"],
    ["isUnderline", true, "=", { previousLines: [ctx("heading 1")] }],
    ["isUnderline", true, "-", { previousLines: [ctx("heading 2")] }],
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
    ["prefix", "", "=", { previousLines: [ctx("heading 1")] }],
    ["prefix", " ", " =", { previousLines: [ctx("heading 1")] }],
    ["prefix", "  ", "  -", { previousLines: [ctx("heading 2")] }],
    ["prefix", "   ", "   -", { previousLines: [ctx("heading 2")] }],
    ["suffix", "", "=", { previousLines: [ctx("heading 1")] }],
    ["suffix", " ", "= ", { previousLines: [ctx("heading 1")] }],
    ["suffix", "  ", "-  ", { previousLines: [ctx("heading 2")] }],
    ["suffix", "   ", "-   ", { previousLines: [ctx("heading 2")] }],
    ["text", "===", " ===  ", { previousLines: [ctx("heading 1")] }],
    ["text", "---", "  --- ", { previousLines: [ctx("heading 2")] }]
  ]);
});
