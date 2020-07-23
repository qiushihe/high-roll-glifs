import last from "lodash/fp/last";

import { getRule } from "./index";

const BLOCK_QUOTE_REGEXP = new RegExp("^(\\s{0,3}>\\s?)(.*)$", "i");

const parse = (adaptedLine, state) => {
  const lineMatch = adaptedLine.match(BLOCK_QUOTE_REGEXP);

  if (lineMatch) {
    return {
      lineType: "block-quote-line",
      lineContext: {
        raw: lineMatch[0],
        blockQuote: {
          // TODO: Fill in this here
        }
      }
    };
  } else {
    const previousLine = last(state.previousLines);

    if (previousLine) {
      const { type: previousLineType } = previousLine;

      if (previousLineType === "block-quote-line") {
        const paragraphRule = getRule("paragraph");
        const paragraphResult = paragraphRule.parse(adaptedLine, {});

        if (paragraphResult) {
          return {
            ...paragraphResult,
            lineType: "block-quote-line",
            lineContext: {
              ...paragraphResult.lineContext,
              blockQuote: {
                // TODO: Fill in this here
              }
            }
          };
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
};

export default { name: "block-quote", parse };
