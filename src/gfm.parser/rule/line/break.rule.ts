import { THEMATIC_BREAK_LINE } from "../line/type";
import { ParsedLine, ParseLineRule, LineContextBuilder } from "../../parser";

const THEMATIC_BREAK_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})((-\\s*?){3,}|(_\\s*?){3,}|(\\*\\s*?){3,})(\\s*)$",
  "i"
);

export const parse: ParseLineRule = (raw: string): ParsedLine[] => {
  const parsedLines: ParsedLine[] = [];

  const lineMatch = raw.match(THEMATIC_BREAK_LINE_REGEXP);
  if (lineMatch) {
    const lineText = lineMatch[0] || "";
    const prefix = lineMatch[1] || "";
    const text = lineMatch[2] || "";
    const suffix = lineMatch[6] || "";

    parsedLines.push({
      type: THEMATIC_BREAK_LINE,
      context: LineContextBuilder.new(lineText)
        .thematicBreak(prefix, text, suffix)
        .build()
    });
  }

  return parsedLines;
};

export default { name: "break", parse };
