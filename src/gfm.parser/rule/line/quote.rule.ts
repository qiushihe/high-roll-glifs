import { BLOCK_QUOTE_LINE } from "../line/type";
import { ParsedLine, ParseLineRule, LineContextBuilder } from "../../parser";

const BLOCK_QUOTE_REGEXP = new RegExp("^(\\s{0,3}>\\s?)(.*)$", "i");

export const parse: ParseLineRule = (raw: string): ParsedLine[] => {
  const parsedLines: ParsedLine[] = [];

  const lineMatch = raw.match(BLOCK_QUOTE_REGEXP);
  if (lineMatch) {
    const lineText = lineMatch[0] || "";
    const prefix = lineMatch[1] || "";
    const text = lineMatch[2] || "";

    parsedLines.push({
      type: BLOCK_QUOTE_LINE,
      context: LineContextBuilder.new(lineText).blockQuote(prefix, text).build()
    });
  }

  return parsedLines;
};

export default { name: "quote", parse };
