import { AdaptedStream } from "../../stream/adapter";
import { ParseBlockRule, ParsedBlock, LineContextBuilder } from "../../parser";

const EMPTY_LINE_REGEXP = new RegExp("^$", "i");

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock | null => {
  const lineType = "empty-line";
  const lineMatch = stream.match(EMPTY_LINE_REGEXP);

  if (lineMatch) {
    const lineText = "";
    const lineContext = LineContextBuilder.new(lineText).empty().build();

    return {
      lineType,
      lineContext,
      inlineTokens: [],
      restInlineTokens: [],
    };
  } else {
    return null;
  }
};

export default { name: "empty", parse };
