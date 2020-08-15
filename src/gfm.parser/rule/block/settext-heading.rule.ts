import last from "lodash/fp/last";
import trim from "lodash/fp/trim";

import {
  AdaptedStream,
  ParseBlockRule,
  ParsedBlock,
  ParserState
} from "../../type";

import { adaptString } from "../../stream/adapter";
import { parseBlock } from "../../gfm.parser";

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
  const underlineMatch = stream.match(SETTEXT_HEADING_UNDERLINE_REGEXP);
  const lineMatch = stream.match(SETTEXT_HEADING_LINE_REGEXP);

  if (underlineMatch) {
    const previousLine = last(state.previousLines);

    if (previousLine) {
      const { type: previousLineType } = previousLine;

      if (previousLineType === "settext-heading-line") {
        return {
          lineType: "settext-heading-line",
          lineContext: {
            raw: underlineMatch[0],
            settextHeading: {
              isUnderline: true,
              text: underlineMatch[2],
              prefix: underlineMatch[1],
              suffix: underlineMatch[5],
              level: trim(underlineMatch[2]).match(/=/) ? 1 : 2
            }
          }
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
        const offsetLineResult = parseBlock(adaptString(offsetLine), {});

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
      return {
        lineType: "settext-heading-line",
        lineContext: {
          raw: lineMatch[0],
          settextHeading: {
            isUnderline: false,
            text: lineMatch[2],
            prefix: lineMatch[1],
            suffix: lineMatch[4],
            level: trim(offsetUnderlineMatch[2]).match(/=/) ? 1 : 2
          }
        }
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default { name: "settext-heading", parse };
