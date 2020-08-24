import size from "lodash/fp/size";

import { getRules as getBlockRules } from "../rule/block/rule";
import { AdaptedStream } from "../stream/adapter";
import { ParserState } from "./parser";
import { LineContext } from "./line.context";

export interface ParsedBlock {
  lineType: string;
  lineContext: LineContext;
  inlineTokens: string[][];
  restInlineTokens: string[][];
}

export type ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
) => ParsedBlock | null;

export const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock | null => {
  const blockRules = getBlockRules();

  let lineType = null;
  let lineContext = null;
  let inlineTokens = null;
  let restInlineTokens = null;

  // Apply block level parsing rules.
  for (let ruleIndex = 0; ruleIndex < size(blockRules); ruleIndex++) {
    const blockRule = blockRules[ruleIndex];
    const blockRuleResult = blockRule.parse(stream, state);

    if (blockRuleResult) {
      lineType = blockRuleResult.lineType;
      lineContext = blockRuleResult.lineContext;
      inlineTokens = blockRuleResult.inlineTokens;
      restInlineTokens = blockRuleResult.restInlineTokens;
      break;
    }
  }

  if (lineType && lineContext && inlineTokens && restInlineTokens) {
    return { lineType, lineContext, inlineTokens, restInlineTokens };
  } else {
    return null;
  }
};
