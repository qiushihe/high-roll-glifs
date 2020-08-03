import size from "lodash/fp/size";

const parse = line => {
  const { type: lineType } = line;

  if (lineType === "atx-heading-line") {
    const {
      atxHeading: { level, text, prefix, suffix }
    } = line;

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
};

export default { name: "block-token", parse };
