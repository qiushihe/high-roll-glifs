import size from "lodash/fp/size";

import { LineState, ParsedInline, ParseInlineRule } from "../../type";

const parse: ParseInlineRule = (line: LineState): ParsedInline | null => {
  const { type: lineType } = line;

  if (lineType === "atx-heading-line") {
    const {
      context: { atxHeading }
    } = line;

    if (atxHeading) {
      const { level, text, prefix, suffix } = atxHeading;

      const headingLevel = `atx-heading-level-${level}`;

      return {
        inlineTokens: [
          ...Array(size(prefix)).fill([headingLevel, "block-syntax"]),
          ...Array(level).fill([headingLevel, "block-syntax"]),
          [headingLevel, "block-syntax"],
          ...Array(size(text)).fill([headingLevel]),
          ...Array(size(suffix)).fill([headingLevel, "block-syntax"])
        ],
        inlineContext: {}
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default { name: "block-token", parse };
