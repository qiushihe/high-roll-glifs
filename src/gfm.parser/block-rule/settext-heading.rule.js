import last from "lodash/fp/last";

const SETTEXT_HEADING_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})(([^\\s]\\s*?)+)(\\s*)$",
  "i"
);

const SETTEXT_HEADING_UNDERLINE_REGEXP = new RegExp(
  "^(\\s{0,3})((-+)|(=+))(\\s*)$",
  "i"
);

const parse = (adaptedLine, state) => {
  const underlineMatch = adaptedLine.match(SETTEXT_HEADING_UNDERLINE_REGEXP);
  const lineMatch = adaptedLine.match(SETTEXT_HEADING_LINE_REGEXP);

  if (underlineMatch) {
    const previousLine = last(state.previousLines);
    if (previousLine) {
      const previousUnderlineMatch = previousLine.raw.match(
        SETTEXT_HEADING_UNDERLINE_REGEXP
      );

      const previousLineMatch = previousLine.raw.match(
        SETTEXT_HEADING_LINE_REGEXP
      );

      if (!previousUnderlineMatch && previousLineMatch) {
        return {
          lineType: "settext-heading-line",
          lineContext: {
            raw: underlineMatch[0],
            settextHeading: {
              isUnderline: true,
              // TODO: Populate `level` here.
              level: 99
            }
          }
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  if (lineMatch) {
    const nextLine = adaptedLine.lookAhead(1);

    if (nextLine) {
      const nextLineMatch = nextLine.match(SETTEXT_HEADING_UNDERLINE_REGEXP);
      if (nextLineMatch) {
        return {
          lineType: "settext-heading-line",
          lineContext: {
            raw: lineMatch[0],
            settextHeading: {
              isUnderline: false,
              // TODO: Populate `level` here.
              level: 99
            }
          }
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default { name: "settext-heading", parse };
