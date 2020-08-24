import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import slice from "lodash/fp/slice";

import { AdaptedStream } from "../../stream/adapter";
import { getConflictMap } from "../inline/rule";

import {
  ParseBlockRule,
  ParsedBlock,
  ParserState,
  LineContextBuilder,
  parseInline,
  collectLines,
  resumeTokens,
  recombobulator,
  shouldParseInlineTokens,
} from "../../parser";

const PARAGRAPH_LINE_REGEXP = new RegExp("^(\\s*[^\\s]+\\s*)+$", "i");

const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock | null => {
  const lineType = "paragraph-line";
  const lineMatch = stream.match(PARAGRAPH_LINE_REGEXP);

  if (lineMatch) {
    const lineText = lineMatch[0];
    const lineContext = LineContextBuilder.new(lineText).paragraph().build();

    let inlineTokens: string[][] = [];
    let restInlineTokens: string[][] = [];

    if (shouldParseInlineTokens(state)) {
      let combinedTokens = resumeTokens(state);
      if (!combinedTokens) {
        const combinedLines = collectLines(stream, lineType, lineContext);
        const combinedText = combinedLines.join(" ");

        combinedTokens = flow([
          parseInline,
          recombobulator(combinedText.length, getConflictMap()),
        ])(combinedText);
      }

      inlineTokens = slice(0, lineText.length)(combinedTokens);

      // The `+ 1` is to get rid of the space (i.e. the linebreak) as well.
      restInlineTokens = slice(
        lineText.length + 1,
        size(combinedTokens)
      )(combinedTokens);
    }

    return { lineType, lineContext, inlineTokens, restInlineTokens };
  } else {
    return null;
  }
};

export default { name: "paragraph", parse };
