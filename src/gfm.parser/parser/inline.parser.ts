import flow from "lodash/fp/flow";
import intersection from "lodash/fp/intersection";
import keys from "lodash/fp/keys";
import without from "lodash/fp/without";

import {
  getConflictMap,
  getRules as getInlineRules
} from "../rule/inline/rule";

export type ParseInlineRule = (text: string) => string[][];

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

export const parseLines = (lines: string[]): string[][][] => {
  const combinedText = lines.join(" ");

  const combinedTokens = flow([
    parse,
    recombobulator(combinedText.length, getConflictMap())
  ])(combinedText);

  const lineTokens: string[][][] = [];

  let sliceStart = 0;
  let sliceEnd = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineText = lines[lineIndex];

    // Set the end of the slice relative to the start.
    sliceEnd = sliceStart + lineText.length;

    // Slice the inline tokens for the current line.
    lineTokens.push(combinedTokens.slice(sliceStart, sliceEnd));

    // Set the start relative to the end.
    // The `+ 1` is to get rid of the space which comes from the linebreak via the `.join(" ")`.
    sliceStart = sliceEnd + 1;
  }

  return lineTokens;
};

// Recombobulator - Epic Neutral Utility Function
// 2 Mana - 3 Attack / 2 Toughness
// Battlecry: Combine multiple layers of inline styles into a single layer.
//            Also resolve any inline style conflicts at the same time.
export const recombobulator = (
  lineLength: number,
  conflictMap: { [key: string]: string[] }
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
      const conflictors = intersection(result[index])(keys(conflictMap));

      // For each of those potentially conflicting inline tokens ...
      conflictors.forEach((conflictor) => {
        // ... get the list of inline tokens that the inline token would conflict with.
        const conflictees = intersection(result[index])(
          conflictMap[conflictor]
        );

        // Remove conflicting inline tokens from the current index.
        result[index] = without(conflictees)(result[index]);

        // Loop over characters backward from before the current index ...
        let bIndex = index - 1;
        while (true) {
          if (
            // If ...
            // * The loop reached the start of the array; Or ...
            bIndex < 0 ||
            // * The preceding index has no matching conflicting inline tokens ...
            intersection(conflictees)(result[bIndex]).length <= 0
          ) {
            break; // ... then stop.
          }

          // Remove conflicting inline tokens from preceding indices.
          result[bIndex] = without(conflictees)(result[bIndex]);
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
            intersection(conflictees)(result[fIndex]).length <= 0
          ) {
            break; // ... then stop.
          }

          // Remove conflicting inline tokens from subsequent indices.
          result[fIndex] = without(conflictees)(result[fIndex]);
          fIndex += 1;
        }
      });
    }
  }

  return result;
};
