const EMPTY_LINE_REGEXP = new RegExp("^$", "i");

const parse = adaptedLine => {
  const lineMatch = adaptedLine.match(EMPTY_LINE_REGEXP);

  if (lineMatch) {
    return {
      lineType: "empty-line",
      lineContext: {
        raw: ""
      }
    };
  } else {
    return null;
  }
};

export default { name: "empty", parse };
