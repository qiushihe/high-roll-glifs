import { LIST_ITEM_LINE } from "../line/type";
import { ParsedLine, ParseLineRule, LineContextBuilder } from "../../parser";

const BULLET_LIST_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})([-+*])(\\s?)(.*)$",
  "i"
);

const ORDERED_LIST_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})([0-9]{1,9})([.)])(\\s?)(.*)$",
  "i"
);

export const parse: ParseLineRule = (raw: string): ParsedLine[] => {
  const parsedLines: ParsedLine[] = [];

  const bulletMatch = raw.match(BULLET_LIST_LINE_REGEXP);
  if (bulletMatch) {
    const lineText = bulletMatch[0] || "";
    const prefix = bulletMatch[1] || "";
    const marker = bulletMatch[2] || "";
    const spaces = bulletMatch[3] || "";
    const content = bulletMatch[4] || "";

    parsedLines.push({
      type: LIST_ITEM_LINE,
      context: LineContextBuilder.new(lineText)
        .listItem("bullet", prefix, "", marker, spaces, content)
        .build()
    });
  }

  const orderedMatch = raw.match(ORDERED_LIST_LINE_REGEXP);
  if (orderedMatch) {
    const lineText = orderedMatch[0] || "";
    const prefix = orderedMatch[1] || "";
    const digits = orderedMatch[2] || "";
    const marker = orderedMatch[3] || "";
    const spaces = orderedMatch[4] || "";
    const content = orderedMatch[5] || "";

    parsedLines.push({
      type: LIST_ITEM_LINE,
      context: LineContextBuilder.new(lineText)
        .listItem("ordered", prefix, digits, marker, spaces, content)
        .build()
    });
  }

  return parsedLines;
};

export default { name: "list", parse };
