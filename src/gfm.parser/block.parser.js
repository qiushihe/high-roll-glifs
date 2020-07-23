import size from "lodash/fp/size";

import { getRules as getBlockRules } from "./block-rule";

export const parseBlock = (stream, state) => {
  const blockRules = getBlockRules();

  let lineType = null;
  let lineContext = null;
  let ruleIndex = 0;

  while (true) {
    if (ruleIndex >= size(blockRules)) {
      break;
    }

    const rule = blockRules[ruleIndex];
    const ruleResult = rule.parse(stream, state);

    if (ruleResult) {
      lineType = ruleResult.lineType;
      lineContext = ruleResult.lineContext;
      break;
    }

    ruleIndex += 1;
  }

  return { lineType, lineContext };
};
