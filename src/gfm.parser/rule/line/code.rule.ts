import { FENCED_CODE_FENCE_LINE, INDENTED_CODE_LINE } from "../line/type";
import { ParsedLine, ParseLineRule, LineContextBuilder } from "../../parser";

const FENCED_CODE_FENCE_REGEXP = new RegExp(
  "^(\\s{0,3})(((`{3,})(\\s*[^`]*\\s*))|((~{3,})(\\s*[^~]*\\s*)))$",
  "i"
);

const INDENTED_CODE_REGEXP = new RegExp("^\\s{4}(.+)$", "i");

export const parse: ParseLineRule = (raw: string): ParsedLine[] => {
  const parsedLines: ParsedLine[] = [];

  const fencedCodeFenceLineMatch = raw.match(FENCED_CODE_FENCE_REGEXP);
  if (fencedCodeFenceLineMatch) {
    const lineText = fencedCodeFenceLineMatch[0] || "";
    const info =
      fencedCodeFenceLineMatch[5] || fencedCodeFenceLineMatch[8] || "";

    parsedLines.push({
      type: FENCED_CODE_FENCE_LINE,
      context: LineContextBuilder.new(lineText).fencedCodeFence(info).build()
    });
  }

  const indentedCodeLineMatch = raw.match(INDENTED_CODE_REGEXP);
  if (indentedCodeLineMatch) {
    const lineText = indentedCodeLineMatch[0] || "";

    parsedLines.push({
      type: INDENTED_CODE_LINE,
      context: LineContextBuilder.new(lineText).indentedCode().build()
    });
  }

  return parsedLines;
};

export default { name: "code", parse };
