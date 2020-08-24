import { AdaptedStream } from "../../stream/adapter";
import { ParseBlockRule, ParsedBlock, LineContextBuilder } from "../../parser";

const THEMATIC_BREAK_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})((-\\s*?){3,}|(_\\s*?){3,}|(\\*\\s*?){3,})(\\s*)$",
  "i"
);

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock | null => {
  const lineType = "thematic-break-line";
  const lineMatch = stream.match(THEMATIC_BREAK_LINE_REGEXP);

  if (lineMatch) {
    const lineText = lineMatch[0] || "";
    const prefix = lineMatch[1] || "";
    const text = lineMatch[2] || "";
    const suffix = lineMatch[6] || "";
    const lineContext = LineContextBuilder.new(lineText)
      .thematicBreak(prefix, text, suffix)
      .build();

    return {
      lineType,
      lineContext,
      inlineTokens: [],
      restInlineTokens: [],
    };
  } else {
    return null;
  }
};

export default { name: "thematic-break", parse };
