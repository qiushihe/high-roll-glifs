import size from "lodash/fp/size";

const parse = ({ lineType, lineContext }) => {
  if (lineType === "atx-heading-line") {
    const {
      atxHeading: { level, text, prefix, suffix }
    } = lineContext;

    const headingLevel = `atx-heading-level-${level}`;

    return [
      ...Array(size(prefix)).fill([headingLevel, "block-syntax"]),
      ...Array(level).fill([headingLevel, "block-syntax"]),
      [headingLevel, "block-syntax"],
      ...Array(size(text)).fill([headingLevel]),
      ...Array(size(suffix)).fill([headingLevel, "block-syntax"])
    ];
  } else {
    return null;
  }
};

export default { name: "markdown-syntax", parse };
