import { BLANK_LINE } from "./lineType";
import { AdaptedStream } from "../../stream/adapter";
import { ParseBlockRule, ParsedBlock, LineContextBuilder } from "../../parser";

const BLANK_LINE_REGEXP = new RegExp("^\\s+$", "i");

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const lineMatch = stream.match(BLANK_LINE_REGEXP);

  if (lineMatch) {
    const lineText = lineMatch[0] || "";
    const lineContext = LineContextBuilder.new(lineText).blank().build();

    blockTokens.push({
      lineType: BLANK_LINE,
      lineContext,
      inlineTokens: []
    });
  }

  return blockTokens;
};

export default { name: "blank", parse };
