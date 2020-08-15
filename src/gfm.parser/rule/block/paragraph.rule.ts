import { AdaptedStream, ParseBlockRule, ParsedBlock } from "../../type";

const PARAGRAPH_LINE_REGEXP = new RegExp("^(\\s*[^\\s]+\\s*)+$", "i");

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock | null => {
  const lineMatch = stream.match(PARAGRAPH_LINE_REGEXP);

  if (lineMatch) {
    return {
      lineType: "paragraph-line",
      lineContext: {
        raw: lineMatch[0]
      }
    };
  } else {
    return null;
  }
};

export default { name: "paragraph", parse };
