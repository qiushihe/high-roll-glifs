import last from "lodash/fp/last";

import { AdaptedStream, adaptString } from "../../stream/adapter";
import { ParserState } from "../../parser";

import {
  parse as parseBlock,
  ParseBlockRule,
  ParsedBlock
} from "../../block.parser";

const BLOCK_QUOTE_REGEXP = new RegExp("^(\\s{0,3}>\\s?)(.*)$", "i");

const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock | null => {
  const lineMatch = stream.match(BLOCK_QUOTE_REGEXP);

  if (lineMatch) {
    return {
      lineType: "block-quote-line",
      lineContext: {
        raw: lineMatch[0],
        blockQuote: {
          // TODO: Fill in this here
          prefix: "__todo__",
          text: "__todo__"
        }
      },
      inlineTokens: []
    };
  } else {
    const previousLine = last(state.previousLines);

    if (previousLine) {
      const { type: previousLineType } = previousLine;

      if (previousLineType === "block-quote-line") {
        const line = stream.lookAhead(0) || "";
        const lineResult = parseBlock(adaptString(line), {});

        if (lineResult) {
          const {
            lineType,
            lineContext: { raw }
          } = lineResult;

          if (lineType === "paragraph-line") {
            return {
              lineType: "block-quote-line",
              lineContext: {
                raw,
                blockQuote: {
                  // TODO: Fill in this here
                  prefix: "__todo__",
                  text: "__todo__"
                }
              },
              inlineTokens: []
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
