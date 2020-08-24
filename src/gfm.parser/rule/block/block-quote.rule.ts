import last from "lodash/fp/last";

import { AdaptedStream, adaptString } from "../../stream/adapter";

import {
  ParserState,
  ParseBlockRule,
  ParsedBlock,
  LineContextBuilder,
  parseBlock,
} from "../../parser";

const BLOCK_QUOTE_REGEXP = new RegExp("^(\\s{0,3}>\\s?)(.*)$", "i");

const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock | null => {
  const lineType = "block-quote-line";
  const lineMatch = stream.match(BLOCK_QUOTE_REGEXP);

  if (lineMatch) {
    const lineText = lineMatch[0] || "";
    const prefix = "__todo__"; // TODO: Fill in this
    const text = "__todo__"; // TODO: Fill in this
    const lineContext = LineContextBuilder.new(lineText)
      .blockQuote(prefix, text)
      .build();

    return {
      lineType,
      lineContext,
      inlineTokens: [],
      restInlineTokens: [],
    };
  } else {
    const previousLine = last(state.previousLines);

    if (previousLine) {
      const { type: previousLineType } = previousLine;

      if (previousLineType === lineType) {
        const currentLine = stream.lookAhead(0) || "";
        const currentLineResult = parseBlock(adaptString(currentLine), {
          context: { skipInlineTokens: true },
        });

        if (currentLineResult) {
          const {
            lineType: currentLineType,
            lineContext: { raw: currentLineText },
          } = currentLineResult;

          if (currentLineType === "paragraph-line") {
            const prefix = "__todo__"; // TODO: Fill in this
            const text = "__todo__"; // TODO: Fill in this
            const lineContext = LineContextBuilder.new(currentLineText)
              .blockQuote(prefix, text)
              .build();

            return {
              lineType,
              lineContext,
              inlineTokens: [],
              restInlineTokens: [],
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
    } else {
      return null;
    }
  }
};

export default { name: "block-quote", parse };
