import { AdaptedStream } from "../../stream/adapter";
import { ParseBlockRule, ParsedBlock, LineContextBuilder } from "../../parser";

const BLANK_LINE_REGEXP = new RegExp("^\\s+$", "i");

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock | null => {
  const lineType = "blank-line";
  const lineMatch = stream.match(BLANK_LINE_REGEXP);

  if (lineMatch) {
    const lineText = lineMatch[0] || "";
    const lineContext = LineContextBuilder.new(lineText).blank().build();

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

export default { name: "blank", parse };
