import { match } from "/src/util/expression.util";

import { THEMATIC_BREAK_LINE_REGEXP } from "../expression/block.expression";

import { blockRuleParser, ThematicBreak } from "./type";

const matchLine = match(THEMATIC_BREAK_LINE_REGEXP);

const parse: blockRuleParser = (line: string): ThematicBreak | null => {
  const lineMatch = matchLine(line);

  if (lineMatch) {
    return {
      type: "thematic-break",
      prefix: lineMatch[1] || "",
      text: lineMatch[2] || "",
      suffix: lineMatch[6] || ""
    };
  } else {
    return null;
  }
};

export default { name: "thematic-break", parse };
