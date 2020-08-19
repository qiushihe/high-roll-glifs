import { AdaptedStream } from "../../stream/adapter";
import { ParseBlockRule, ParsedBlock } from "../../block.parser";

const EMPTY_LINE_REGEXP = new RegExp("^$", "i");

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock | null => {
  const lineMatch = stream.match(EMPTY_LINE_REGEXP);

  if (lineMatch) {
    return {
      lineType: "empty-line",
      lineContext: {
        raw: ""
      },
      inlineTokens: []
    };
  } else {
    return null;
  }
};

export default { name: "empty", parse };
