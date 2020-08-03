import size from "lodash/fp/size";

import { getRules as getBlockRules } from "./rule/block";

export const parseBlock = (stream, state) => {
  const blockRules = getBlockRules();

  let lineType = null;
  let lineContext = null;

  // Apply block level parsing rules.
  for (let ruleIndex = 0; ruleIndex < size(blockRules); ruleIndex++) {
    const blockRule = blockRules[ruleIndex];
    const blockRuleResult = blockRule.parse(stream, state);

    if (blockRuleResult) {
      lineType = blockRuleResult.lineType;
      lineContext = blockRuleResult.lineContext;
      break;
    }
  }

  return { lineType, lineContext };
};
