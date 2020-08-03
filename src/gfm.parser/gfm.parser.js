import getOr from "lodash/fp/getOr";
import size from "lodash/fp/size";
import times from "lodash/fp/times";
import isNil from "lodash/fp/isNil";
import isEmpty from "lodash/fp/isEmpty";

import { getRules as getBlockRules } from "./rule/block";
import { getRules as getInlineRules } from "./rule/inline";

export const parse = (stream, state) => {
  const blockRules = getBlockRules();
  const inlineRules = getInlineRules();

  let lineType = null;
  let lineContext = null;
  let lineTokens = null;

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

  // If block level parsing is successful ...
  if (!isNil(lineType) && !isNil(lineContext)) {
    const { raw } = lineContext;
    const lineLength = size(raw);

    // ... fill inline tokens array with empty arrays for each character ...
    lineTokens = Array(lineLength).fill([]);

    // ... then apply inline token parsing rules.
    for (let ruleIndex = 0; ruleIndex < size(inlineRules); ruleIndex++) {
      const inlineRule = inlineRules[ruleIndex];
      const inlineRuleResult = inlineRule.parse({
        type: lineType,
        ...lineContext
      });

      if (!isEmpty(inlineRuleResult)) {
        times(characterIndex => {
          lineTokens[characterIndex] = [
            ...lineTokens[characterIndex],
            ...getOr([], characterIndex)(inlineRuleResult)
          ];
        })(lineLength);
      }
    }
  }

  return { lineType, lineContext, lineTokens };
};
