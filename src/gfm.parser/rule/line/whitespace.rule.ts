import { BLANK_LINE, EMPTY_LINE } from "../line/type";
import { ParsedLine, ParseLineRule, LineContextBuilder } from "../../parser";

const BLANK_LINE_REGEXP = new RegExp("^\\s+$", "i");
const EMPTY_LINE_REGEXP = new RegExp("^$", "i");

export const parse: ParseLineRule = (raw: string): ParsedLine[] => {
  const parsedLines: ParsedLine[] = [];

  const blankLineMatch = raw.match(BLANK_LINE_REGEXP);
  if (blankLineMatch) {
    const lineText = blankLineMatch[0] || "";

    parsedLines.push({
      type: BLANK_LINE,
      context: LineContextBuilder.new(lineText).blank().build()
    });
  }

  const emptyLineMatch = raw.match(EMPTY_LINE_REGEXP);
  if (emptyLineMatch) {
    const lineText = emptyLineMatch[0] || "";

    parsedLines.push({
      type: EMPTY_LINE,
      context: LineContextBuilder.new(lineText).empty().build()
    });
  }

  return parsedLines;
};

export default { name: "whitespace", parse };
