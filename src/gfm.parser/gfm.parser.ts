import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import last from "lodash/fp/last";
import size from "lodash/fp/size";
import times from "lodash/fp/times";
import isNil from "lodash/fp/isNil";
import isEmpty from "lodash/fp/isEmpty";

import {
  AdaptedStream,
  InlineState,
  LineState,
  ParserState,
  ParseBlockRule,
  ParsedBlock,
  ParseStream,
  ParsedStream
} from "./type";

import { adaptString } from "./stream/adapter";
import { getRules as getInlineRules } from "./rule/inline/rule";
import { getRules as getBlockRules } from "./rule/block/rule";

export const parseBlock: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock | null => {
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

  if (lineType && lineContext) {
    return { lineType, lineContext };
  } else {
    return null;
  }
};

export const parse: ParseStream = (
  stream: AdaptedStream,
  state: ParserState
): ParsedStream | null => {
  const inlineRules = getInlineRules();

  // Apply block level parsing rules.
  const block = parseBlock(stream, state);

  // If block level parsing is successful ...
  if (block) {
    const { lineType, lineContext } = block;

    // ... and `lineType` and `lineContext` are valid
    if (!isNil(lineType) && !isNil(lineContext)) {
      const { raw } = lineContext;
      const lineLength = size(raw);

      // ... fill inline tokens array with empty arrays for each character ...
      const inlineTokens: (string[] | null)[] = Array(lineLength).fill([]);

      // ... initialize inline context object ...
      let inlineContext = {};

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
              const atIndex = inlineTokens[characterIndex] || [];
              const atResultIndex =
                inlineRuleResult.inlineTokens[characterIndex] || [];

              inlineTokens[characterIndex] = [...atIndex, ...atResultIndex];
            })(lineLength);
          }

          // ... and persist the resulting inline context under the name of the rule
          inlineContext = {
            ...inlineContext,
            [inlineRule.name]: inlineRuleResult.inlineContext
          };
        }
      }

      return { lineType, lineContext, inlineTokens, inlineContext };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export const resumeInlineTokens = (
  line: LineState,
  state: ParserState,
  contextNamespace: string
): InlineState | null => {
  const {
    context: { raw }
  } = line;

  const lineSize = size(raw);

  const restTokens = flow([
    get("previousLines"),
    last,
    get(`inline.context.${contextNamespace}.restTokens`)
  ])(state);

  if (!isEmpty(restTokens)) {
    const restTokensCount = size(restTokens);

    // This shouldn't happen in theory (maybe it can happen under certain race conditions during
    // active parsing cycles, I donno) ...
    if (lineSize > restTokensCount) {
      return {
        tokens: [...restTokens, ...Array(lineSize - restTokensCount).fill([])],
        context: { restTokens: [] }
      };
    } else {
      return {
        tokens: restTokens.slice(0, lineSize),
        context: { restTokens: restTokens.slice(lineSize) }
      };
    }
  } else {
    return null;
  }
};

export const collectLinesAhead = (
  line: LineState,
  stream: AdaptedStream,
  lineType: string
): string[] => {
  const {
    context: { raw }
  } = line;

  let lines = [raw];
  let lookAhead = 1;

  while (true) {
    const lookAheadText = stream.lookAhead(lookAhead);

    if (isNil(lookAheadText)) {
      break;
    }

    const block = parseBlock(adaptString(lookAheadText), {
      previousLines: [
        { ...line, context: { ...line.context, raw: lines[lines.length - 1] } }
      ]
    });

    if (block) {
      const { lineType: lookAheadLineType } = block;

      if (lookAheadLineType === lineType) {
        lines = [...lines, lookAheadText];
        lookAhead += 1;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return lines;
};
