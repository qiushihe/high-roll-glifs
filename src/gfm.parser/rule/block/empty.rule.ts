import { EMPTY_LINE } from "./lineType";
import { AdaptedStream } from "../../stream/adapter";
import { ParseBlockRule, ParsedBlock, LineContextBuilder } from "../../parser";

const EMPTY_LINE_REGEXP = new RegExp("^$", "i");

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const lineMatch = stream.match(EMPTY_LINE_REGEXP);

  if (lineMatch) {
    const lineText = "";
    const lineContext = LineContextBuilder.new(lineText).empty().build();

    blockTokens.push({
      lineType: EMPTY_LINE,
      lineContext,
      inlineTokens: []
    });
  }

  return blockTokens;
};

export default { name: "empty", parse };
