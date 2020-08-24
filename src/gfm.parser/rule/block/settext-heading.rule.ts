import last from "lodash/fp/last";
import trim from "lodash/fp/trim";

import { AdaptedStream, adaptString } from "../../stream/adapter";

import {
  ParserState,
  ParseBlockRule,
  ParsedBlock,
  LineContextBuilder,
  parseBlock,
} from "../../parser";

const SETTEXT_HEADING_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})(([^\\s]\\s*?)+)(\\s*)$",
  "i"
);

const SETTEXT_HEADING_UNDERLINE_REGEXP = new RegExp(
  "^(\\s{0,3})((-+)|(=+))(\\s*)$",
  "i"
);

// TODO: Add a `restLines` array into the state so we don't have to re-parse all the remaining
//       lines for each remaining line.

const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock | null => {
  const lineType = "settext-heading-line";
  const underlineMatch = stream.match(SETTEXT_HEADING_UNDERLINE_REGEXP);
  const lineMatch = stream.match(SETTEXT_HEADING_LINE_REGEXP);

  if (underlineMatch) {
    const previousLine = last(state.previousLines);

    if (previousLine) {
      const { type: previousLineType } = previousLine;

      if (previousLineType === lineType) {
        const lineText = underlineMatch[0] || "";
        const prefix = underlineMatch[1] || "";
        const text = underlineMatch[2] || "";
        const suffix = underlineMatch[5] || "";
        const level = trim(underlineMatch[2]).match(/=/) ? 1 : 2;
        const lineContext = LineContextBuilder.new(lineText)
          .settextHeading(prefix, text, suffix, level, true)
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
  } else if (lineMatch) {
    let offset = 1;
    let offsetUnderlineMatch = null;

    while (true) {
      const offsetLine = stream.lookAhead(offset);

      if (offsetLine) {
        const offsetLineResult = parseBlock(adaptString(offsetLine), {
          context: { skipInlineTokens: true },
        });

        if (offsetLineResult) {
          const { lineType } = offsetLineResult;
          const match = offsetLine.match(SETTEXT_HEADING_UNDERLINE_REGEXP);

          if (match) {
            offsetUnderlineMatch = match;
            break;
          } else if (lineType === "paragraph-line") {
            offset += 1;
          } else {
            break;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    }

    if (offsetUnderlineMatch) {
      const lineText = lineMatch[0] || "";
      const prefix = lineMatch[1] || "";
      const text = lineMatch[2] || "";
      const suffix = lineMatch[4] || "";
      const level = trim(offsetUnderlineMatch[2]).match(/=/) ? 1 : 2;
      const lineContext = LineContextBuilder.new(lineText)
        .settextHeading(prefix, text, suffix, level, false)
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
};

export default { name: "settext-heading", parse };
