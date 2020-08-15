import { match } from "/src/util/expression.util";

import { ATX_HEADING_LINE_REGEXP } from "../expression/block.expression";

import { blockRuleParser, AtxHeading } from "./type";

const matchLine = match(ATX_HEADING_LINE_REGEXP);

const parse: blockRuleParser = (line: string): AtxHeading | null => {
  const lineMatch = matchLine(line);

  if (lineMatch) {
    return {
      type: "atx-heading",
      prefix: lineMatch[1] || "",
      level: lineMatch[2] || "",
      space: lineMatch[4] || "",
      text: lineMatch[5] || "",
      suffix: lineMatch[6] || ""
    };
  } else {
    return null;
  }
};

export default { name: "atx-heading", parse };
