import getOr from "lodash/fp/getOr";
import size from "lodash/fp/size";
import times from "lodash/fp/times";
import isNil from "lodash/fp/isNil";
import isEmpty from "lodash/fp/isEmpty";

import { getRules as getInlineRules } from "./rule/inline";
import { parseBlock } from "./block.parser";

export const parse = (stream, state) => {
  const inlineRules = getInlineRules();

  let inlineTokens = null;
  let inlineContext = null;

  // Apply block level parsing rules.
  const { lineType, lineContext } = parseBlock(stream, state);

  // If block level parsing is successful ...
  if (!isNil(lineType) && !isNil(lineContext)) {
    const { raw } = lineContext;
    const lineLength = size(raw);

    // ... fill inline tokens array with empty arrays for each character ...
    inlineTokens = Array(lineLength).fill([]);

    // ... initialize inline context object ...
    inlineContext = {};

    // ... then apply inline token parsing rules.
    for (let ruleIndex = 0; ruleIndex < size(inlineRules); ruleIndex++) {
      const inlineRule = inlineRules[ruleIndex];
      const inlineRuleResult = inlineRule.parse(
        {
          type: lineType,
          context: lineContext,
          inline: { tokens: inlineTokens, context: inlineContext }
        },
        state,
        stream
      );

      // If inline parsing was successful ...
      if (inlineRuleResult) {
        // ... recombobulate the resulting inline tokens, ...
        if (!isEmpty(inlineRuleResult.inlineTokens)) {
          times(characterIndex => {
            inlineTokens[characterIndex] = [
              ...inlineTokens[characterIndex],
              ...getOr([], characterIndex)(inlineRuleResult.inlineTokens)
            ];
          })(lineLength);
        }

        // ... and persist the resulting inline context under the name of the rule
        inlineContext = {
          ...inlineContext,
          [inlineRule.name]: inlineRuleResult.inlineContext
        };
      }
    }
  }

  return { lineType, lineContext, inlineTokens, inlineContext };
};
