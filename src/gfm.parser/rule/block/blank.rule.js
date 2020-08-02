const BLANK_LINE_REGEXP = new RegExp("^\\s+$", "i");

const parse = adaptedLine => {
  const lineMatch = adaptedLine.match(BLANK_LINE_REGEXP);

  if (lineMatch) {
    return {
      lineType: "blank-line",
      lineContext: {
        raw: lineMatch[0]
      }
    };
  } else {
    return null;
  }
};

export default { name: "blank", parse };
