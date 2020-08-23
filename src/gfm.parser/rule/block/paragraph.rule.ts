import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import slice from "lodash/fp/slice";

import { AdaptedStream } from "../../stream/adapter";
import { getConflictMap } from "../inline/rule";

import {
  LineContext,
  ParserState,
  ParseBlockRule,
  ParsedBlock,
  parseInline,
  resumeTokens,
  collectLines,
  recombobulator,
} from "../../parser";

const PARAGRAPH_LINE_REGEXP = new RegExp("^(\\s*[^\\s]+\\s*)+$", "i");

const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock | null => {
  const lineMatch = stream.match(PARAGRAPH_LINE_REGEXP);

  if (lineMatch) {
    const lineType = "paragraph-line";
    const lineText = lineMatch[0];
    const lineContext: LineContext = { raw: lineText };

    let combinedTokens = resumeTokens(state, "paragraph");
    if (!combinedTokens) {
      const combinedLines = collectLines(stream, lineType, lineContext);
      const combinedText = combinedLines.join(" ");

      combinedTokens = flow([
        parseInline,
        recombobulator(combinedText.length, getConflictMap()),
      ])(combinedText);
    }

    const inlineTokens = slice(0, lineText.length)(combinedTokens);

    // The `+ 1` is to get rid of the space (i.e. the linebreak) as well.
    const restTokens = slice(
      lineText.length + 1,
      size(combinedTokens)
    )(combinedTokens);

    lineContext.paragraph = { restTokens };

    return { lineType, lineContext, inlineTokens };
  } else {
    return null;
  }
};

export default { name: "paragraph", parse };
