import { getRules as getBlockRules } from "../rule/block/rule";
import { AdaptedStream } from "../stream/adapter";
import { ParserState } from "./parser";
import { BlockContext } from "/src/gfm.parser/parser/block";

export interface ParsedBlock {
  type: string;
  context: BlockContext;
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
  const rules = getBlockRules();
  const blocks: ParsedBlock[] = [];

  for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
    const rule = rules[ruleIndex];
    const ruleBlocks = rule.parse(stream, state);

    if (ruleBlocks.length > 0) {
      blocks.push(...ruleBlocks);
      break;
    }
  }

  return blocks;
};
