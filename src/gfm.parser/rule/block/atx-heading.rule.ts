import { AdaptedStream } from "../../stream/adapter";
import { getConflictMap } from "../inline/rule";

import {
  ParseBlockRule,
  ParsedBlock,
  parseInline,
  recombobulator,
} from "../../parser";

const ATX_HEADING_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})(#{1,6})((\\s)(.*?))?(\\s+#+\\s*)?$",
  "i"
);

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock | null => {
  const lineMatch = stream.match(ATX_HEADING_LINE_REGEXP);

  if (lineMatch) {
    const lineType = "atx-heading-line";
    const lineText = lineMatch[0] || "";

    const prefix = lineMatch[1] || "";
    const level = (lineMatch[2] || "").length;
    const space = lineMatch[4] || "";
    const text = lineMatch[5] || "";
    const suffix = lineMatch[6] || "";

    const lineContext = {
      raw: lineText,
      atxHeading: { level, text, prefix, suffix },
    };

    const levelToken = `atx-heading-level-${level}`;

    const inlineTokens = recombobulator(
      lineText.length,
      getConflictMap()
    )([
      [
        ...Array(prefix.length).fill([levelToken, "block-syntax"]),
        ...Array(level).fill([levelToken, "block-syntax"]),
        ...Array(space.length).fill([levelToken, "block-syntax"]),
        ...Array(text.length).fill([levelToken]),
        ...Array(suffix.length).fill([levelToken, "block-syntax"]),
      ],
      ...parseInline(text).map((layer) => [
        ...Array(prefix.length).fill([]),
        ...Array(level).fill([]),
        ...Array(space.length).fill([]),
        ...layer,
        ...Array(suffix.length).fill([]),
      ]),
    ]);

    return {
      lineType,
      lineContext,
      inlineTokens,
    };
  } else {
    return null;
  }
};

export default { name: "atx-heading", parse };
