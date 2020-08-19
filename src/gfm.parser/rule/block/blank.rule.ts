import { AdaptedStream } from "../../stream/adapter";
import { ParseBlockRule, ParsedBlock } from "../../block.parser";

const BLANK_LINE_REGEXP = new RegExp("^\\s+$", "i");

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock | null => {
  const lineMatch = stream.match(BLANK_LINE_REGEXP);

  if (lineMatch) {
    return {
      lineType: "blank-line",
      lineContext: {
        raw: lineMatch[0]
      },
      inlineTokens: []
    };
  } else {
    return null;
  }
};

export default { name: "blank", parse };
