const PARAGRAPH_LINE_REGEXP = new RegExp("^(\\s*[^\\s]+\\s*)+$", "i");

const parse = adaptedLine => {
  const lineMatch = adaptedLine.match(PARAGRAPH_LINE_REGEXP);

  if (lineMatch) {
    return {
      lineType: "paragraph-line",
      lineContext: {
        raw: lineMatch[0]
      }
    };
  } else {
    return null;
  }
};

export default { name: "paragraph", parse };
