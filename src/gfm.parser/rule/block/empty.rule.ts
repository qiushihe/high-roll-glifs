import { AdaptedStream, ParseBlockRule, ParsedBlock } from "../../type";

const EMPTY_LINE_REGEXP = new RegExp("^$", "i");

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock | null => {
  const lineMatch = stream.match(EMPTY_LINE_REGEXP);

  if (lineMatch) {
    return {
      lineType: "empty-line",
      lineContext: {
        raw: ""
      }
    };
  } else {
    return null;
  }
};

export default { name: "empty", parse };
