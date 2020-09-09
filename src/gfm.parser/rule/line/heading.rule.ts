import { ATX_HEADING_LINE, SETTEXT_HEADING_UNDERLINE_LINE } from "../line/type";
import { ParsedLine, ParseLineRule, LineContextBuilder } from "../../parser";
import trim from "lodash/fp/trim";

const ATX_HEADING_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})(#{1,6})((\\s)(.*?))?(\\s+#+\\s*)?$",
  "i"
);

const SETTEXT_HEADING_UNDERLINE_REGEXP = new RegExp(
  "^(\\s{0,3})((-+)|(=+))(\\s*)$",
  "i"
);

export const parse: ParseLineRule = (raw: string): ParsedLine[] => {
  const parsedLines: ParsedLine[] = [];

  const atxHeadingLineMatch = raw.match(ATX_HEADING_LINE_REGEXP);
  if (atxHeadingLineMatch) {
    const lineText = atxHeadingLineMatch[0] || "";
    const prefix = atxHeadingLineMatch[1] || "";
    const level = (atxHeadingLineMatch[2] || "").length;
    const space = atxHeadingLineMatch[4] || "";
    const text = atxHeadingLineMatch[5] || "";
    const suffix = atxHeadingLineMatch[6] || "";

    parsedLines.push({
      type: ATX_HEADING_LINE,
      context: LineContextBuilder.new(lineText)
        .atxHeading(prefix, level, space, text, suffix)
        .build()
    });
  }

  const settextHeadingUnderlineLineMatch = raw.match(
    SETTEXT_HEADING_UNDERLINE_REGEXP
  );
  if (settextHeadingUnderlineLineMatch) {
    const lineText = settextHeadingUnderlineLineMatch[0] || "";
    const prefix = settextHeadingUnderlineLineMatch[1] || "";
    const text = settextHeadingUnderlineLineMatch[2] || "";
    const suffix = settextHeadingUnderlineLineMatch[5] || "";
    const level = trim(lineText).match(/=/) ? 1 : 2;

    parsedLines.push({
      type: SETTEXT_HEADING_UNDERLINE_LINE,
      context: LineContextBuilder.new(lineText)
        .settextHeadingUnderline(prefix, text, suffix, level)
        .build()
    });
  }

  return parsedLines;
};

export default { name: "heading", parse };
