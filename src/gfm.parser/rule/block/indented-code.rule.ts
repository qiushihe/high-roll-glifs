import last from "lodash/fp/last";

import { AdaptedStream } from "../../stream/adapter";

import {
  ParserState,
  ParseBlockRule,
  ParsedBlock,
  LineContextBuilder,
} from "../../parser";

const INDENTED_CODE_REGEXP = new RegExp("^\\s{4}(.+)$", "i");

const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock | null => {
  const lineType = "indented-code-line";
  const lineMatch = stream.match(INDENTED_CODE_REGEXP);

  if (lineMatch) {
    const previousLine = last(state.previousLines);

    if (previousLine) {
      const { type: previousLineType } = previousLine;

      if (previousLineType === "paragraph-line") {
        return null;
      } else {
        const lineText = lineMatch[0] || "";
        const lineContext = LineContextBuilder.new(lineText)
          .indentedCode()
          .build();

        return {
          lineType,
          lineContext,
          inlineTokens: [],
          restInlineTokens: [],
        };
      }
    } else {
      const lineText = lineMatch[0] || "";
      const lineContext = LineContextBuilder.new(lineText)
        .indentedCode()
        .build();

      return {
        lineType,
        lineContext,
        inlineTokens: [],
        restInlineTokens: [],
      };
    }
  } else {
    return null;
  }
};

export default { name: "indented-code", parse };
