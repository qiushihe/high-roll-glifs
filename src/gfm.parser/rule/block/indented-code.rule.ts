import last from "lodash/fp/last";

import { AdaptedStream } from "../../stream/adapter";
import { ParserState, ParseBlockRule, ParsedBlock } from "../../parser";

const INDENTED_CODE_REGEXP = new RegExp("^\\s{4}(.+)$", "i");

const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock | null => {
  const lineMatch = stream.match(INDENTED_CODE_REGEXP);

  if (lineMatch) {
    const previousLine = last(state.previousLines);

    if (previousLine) {
      const { type: previousLineType } = previousLine;

      if (previousLineType === "paragraph-line") {
        return null;
      } else {
        return {
          lineType: "indented-code-line",
          lineContext: {
            raw: lineMatch[0],
            indentedCode: {
              // TODO: Fill in this here
            },
          },
          inlineTokens: [],
        };
      }
    } else {
      return {
        lineType: "indented-code-line",
        lineContext: {
          raw: lineMatch[0],
          indentedCode: {
            // TODO: Fill in this here
          },
        },
        inlineTokens: [],
      };
    }
  } else {
    return null;
  }
};

export default { name: "indented-code", parse };
