import { PARAGRAPH_LINE } from "../line/type";
import { ParsedLine, ParseLineRule, LineContextBuilder } from "../../parser";

const PARAGRAPH_LINE_REGEXP = new RegExp("^(\\s*[^\\s]+\\s*)+$", "i");

export const parse: ParseLineRule = (raw: string): ParsedLine[] => {
  const parsedLines: ParsedLine[] = [];

  const lineMatch = raw.match(PARAGRAPH_LINE_REGEXP);
  if (lineMatch) {
    const lineText = lineMatch[0] || "";

    parsedLines.push({
      type: PARAGRAPH_LINE,
      context: LineContextBuilder.new(lineText).paragraph().build()
    });
  }

  return parsedLines;
};

export default { name: "paragraph", parse };
