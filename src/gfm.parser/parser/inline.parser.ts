import get from "lodash/fp/get";
import last from "lodash/fp/last";
import isNil from "lodash/fp/isNil";
import intersection from "lodash/fp/intersection";
import keys from "lodash/fp/keys";
import without from "lodash/fp/without";

import { AdaptedStream, adaptString } from "../stream/adapter";
import { getRules as getInlineRules } from "../rule/inline/rule";

import { parse as parseBlock } from "./block.parser";
import { LineContext, ParserState } from "./parser";

export type ParseInlineRule = (text: string) => string[][];

export interface InlineTokenConflictMap {
  conflictor: { [key: string]: string[] };
  conflictee: { [key: string]: string[] };
}

export const parse = (text: string): string[][][] => {
  const inlineRules = getInlineRules();
  const layers: string[][][] = [];

  for (let ruleIndex = 0; ruleIndex < inlineRules.length; ruleIndex++) {
    const inlineRule = inlineRules[ruleIndex];
    const inlineTokens = inlineRule.parse(text);

    layers.push(inlineTokens);
  }

  return layers;
};

export const resumeTokens = (
  state: ParserState,
  contextNamespace: string
): string[][] | null => {
  const previousLine = last(state.previousLines);

  if (previousLine) {
    const context = previousLine.context;
    const restTokens = get(`${contextNamespace}.restTokens`)(context) || [];

    if (restTokens.length > 0) {
      return restTokens;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export const collectLines = (
  stream: AdaptedStream,
  lineType: string,
  lineContext: LineContext
): string[] => {
  const lines = [lineContext.raw];

  let lookAhead = 1;
  let lookAheadLineContext = lineContext;

  while (true) {
    const lookAheadText = stream.lookAhead(lookAhead);

    if (isNil(lookAheadText)) {
      break;
    }

    const block = parseBlock(adaptString(lookAheadText), {
      previousLines: [{ type: lineType, context: lookAheadLineContext }],
    });

    if (block) {
      const { lineType: blockLineType, lineContext: blockLineContext } = block;

      if (blockLineType === lineType) {
        lines.push(lookAheadText);
        lookAheadLineContext = blockLineContext;
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

// Recombobulator - Epic Neutral Utility Function
// 2 Mana - 3 Attack / 2 Toughness
// Battlecry: Combine multiple layers of inline styles into a single layer.
//            Also resolve any inline style conflicts at the same time.
export const recombobulator = (
  lineLength: number,
  conflictMap: InlineTokenConflictMap
) => (layers: string[][][]): string[][] => {
  const result: string[][] = Array(lineLength).fill([]);

  if (layers.length > 0) {
    // Loop over the 2D array of inline styles and combine them into a 1D array.
    for (let cIndex = 0; cIndex < lineLength; cIndex++) {
      for (let lIndex = 0; lIndex < layers.length; lIndex++) {
        result[cIndex] = [...result[cIndex], ...layers[lIndex][cIndex]];
      }
    }

    // Loop over the now 1D array of inline styles ...
    for (let index = 0; index < lineLength; index++) {
      // Find the list of inline tokens for the current character that could potentially
      // conflict with other inline tokens.
      const conflictors = intersection(result[index])(
        keys(conflictMap.conflictor)
      );

      // For each of those potentially conflicting inline tokens ...
      conflictors.forEach((conflictor) => {
        // ... get the list of inline tokens that the inline token would conflict with.
        const conflictees = intersection(result[index])(
          conflictMap.conflictor[conflictor]
        );

        // For each conflicting inline token ...
        conflictees.forEach((conflictee) => {
          // ... get all related conflicting inline tokens.
          const relatedConflictees = [
            conflictee,
            ...conflictMap.conflictee[conflictee],
          ];

          // Remove conflicting inline tokens from the current index.
          result[index] = without(relatedConflictees)(result[index]);

          // Loop over characters backward from before the current index ...
          let bIndex = index - 1;
          while (true) {
            if (
              // If ...
              // * The loop reached the start of the array; Or ...
              bIndex < 0 ||
              // * The preceding index has no matching conflicting inline tokens ...
              intersection(relatedConflictees)(result[bIndex]).length <= 0
            ) {
              break; // ... then stop.
            }

            // Remove conflicting inline tokens from preceding indices.
            result[bIndex] = without(relatedConflictees)(result[bIndex]);
            bIndex += -1;
          }

          // Loop over characters forward from after the current index ...
          let fIndex = index + 1;
          while (true) {
            if (
              // If ...
              // * The loop reached the end of the array; Or ...
              fIndex >= lineLength ||
              // * The subsequent index has no matching conflicting inline tokens ...
              intersection(relatedConflictees)(result[fIndex]).length <= 0
            ) {
              break; // ... then stop.
            }

            // Remove conflicting inline tokens from subsequent indices.
            result[fIndex] = without(relatedConflictees)(result[fIndex]);
            fIndex += 1;
          }
        });
      });
    }
  }

  return result;
};
