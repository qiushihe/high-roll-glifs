import size from "lodash/fp/size";

import { getRules as getBlockRules } from "../rule/block/rule";
import { AdaptedStream } from "../stream/adapter";
import { ParserState } from "./parser";
import { LineContext } from "./line.context";

export interface ParsedBlock {
  lineType: string;
  lineContext: LineContext;
  inlineTokens: string[][];
}

export type ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
) => ParsedBlock[];

export const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock[] => {
  const blockRules = getBlockRules();
  const blocks: ParsedBlock[] = [];

  // Apply block level parsing rules.
  for (let ruleIndex = 0; ruleIndex < size(blockRules); ruleIndex++) {
    const blockRule = blockRules[ruleIndex];
    const ruleBlocks = blockRule.parse(stream, state);

    if (ruleBlocks.length > 0) {
      blocks.push(...ruleBlocks);
      break;
    }
  }

  return blocks;
};
