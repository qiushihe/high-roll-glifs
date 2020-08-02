import size from "lodash/fp/size";
import isNil from "lodash/fp/isNil";
import getOr from "lodash/fp/getOr";

import { getRules as getBlockRules } from "./rule/block";
import { getRules as getInlineRules } from "./rule/inline";

export const parseBlock = (stream, state) => {
  const blockRules = getBlockRules();
  const inlineRules = getInlineRules();

  let lineType = null;
  let lineContext = null;
  let lineTokens = null;

  let blockRuleIndex = 0;

  while (true) {
    if (blockRuleIndex >= size(blockRules)) {
      break;
    }

    const blockRule = blockRules[blockRuleIndex];
    const blockRuleResult = blockRule.parse(stream, state);

    if (blockRuleResult) {
      lineType = blockRuleResult.lineType;
      lineContext = blockRuleResult.lineContext;
      break;
    }

    blockRuleIndex += 1;
  }

  if (!isNil(lineType) && !isNil(lineContext)) {
    let inlineTokens = [];
    let inlineRuleIndex = 0;

    while (true) {
      if (inlineRuleIndex >= size(inlineRules)) {
        break;
      }

      const inlineRule = inlineRules[inlineRuleIndex];
      const inlineRuleResult = inlineRule.parse({ lineType, lineContext });

      inlineTokens = [...inlineTokens, inlineRuleResult];

      inlineRuleIndex += 1;
    }

    const { raw } = lineContext;

    let combinedTokens = [];
    let characterIndex = 0;

    while (true) {
      if (characterIndex >= size(raw)) {
        break;
      }

      combinedTokens[characterIndex] = [];

      let inlineTokenIndex = 0;

      while (true) {
        if (inlineTokenIndex >= size(inlineTokens)) {
          break;
        }

        const inlineToken = inlineTokens[inlineTokenIndex];

        combinedTokens[characterIndex] = [
          ...combinedTokens[characterIndex],
          ...getOr([], characterIndex)(inlineToken)
        ];

        inlineTokenIndex += 1;
      }

      characterIndex += 1;
    }

    if (combinedTokens.length > 0) {
      lineTokens = combinedTokens;
    }
  }

  return { lineType, lineContext, lineTokens };
};
