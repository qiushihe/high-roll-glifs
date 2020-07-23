import getOr from "lodash/fp/getOr";

const THEMATIC_BREAK_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})((-\\s*?){3,}|(_\\s*?){3,}|(\\*\\s*?){3,})(\\s*)$",
  "i"
);

const parse = adaptedLine => {
  const lineMatch = adaptedLine.match(THEMATIC_BREAK_LINE_REGEXP);

  if (lineMatch) {
    return {
      lineType: "thematic-break-line",
      lineContext: {
        raw: lineMatch[0],
        thematicBreak: {
          prefix: getOr("", 1)(lineMatch),
          text: getOr("", 2)(lineMatch),
          suffix: getOr("", 6)(lineMatch)
        }
      }
    };
  } else {
    return null;
  }
};

export default { name: "thematic-break", parse };
