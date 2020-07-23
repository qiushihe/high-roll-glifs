import last from "lodash/fp/last";

const INDENTED_CODE_REGEXP = new RegExp("^\\s{4}(.+)$", "i");

const parse = (adaptedLine, state) => {
  const lineMatch = adaptedLine.match(INDENTED_CODE_REGEXP);

  if (lineMatch) {
    const previousLine = last(state.previousLines);

    if (previousLine) {
      const { type: previousLineType } = previousLine;

      if (previousLineType === "paragraph-line") {
        return null;
      } else {
        return {
          lineType: "indented-code-line",
          lineContext: {
            raw: lineMatch[0],
            indentedCode: {
              // TODO: Fill in this here
            }
          }
        };
      }
    } else {
      return {
        lineType: "indented-code-line",
        lineContext: {
          raw: lineMatch[0],
          indentedCode: {
            // TODO: Fill in this here
          }
        }
      };
    }
  } else {
    return null;
  }
};

export default { name: "indented-code", parse };
