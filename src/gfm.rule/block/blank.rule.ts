import { match } from "/src/util/expression.util";

import { BLANK_LINE_REGEXP } from "../expression/block.expression";

import { blockRuleParser, Blank } from "./type";

const matchLine = match(BLANK_LINE_REGEXP);

const parse: blockRuleParser = (line: string): Blank | null => {
  const lineMatch = matchLine(line);

  if (lineMatch) {
    return {
      type: "blank",
      text: lineMatch[0] || ""
    };
  } else {
    return null;
  }
};

export default { name: "blank", parse };
