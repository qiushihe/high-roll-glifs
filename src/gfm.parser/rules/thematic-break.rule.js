import getOr from "lodash/fp/getOr";

const THEMATIC_BREAK_REGEXP = new RegExp(
  "^(\\s{0,3})((-\\s*?){3,}|(_\\s*?){3,}|(\\*\\s*?){3,})(\\s*)$"
);

const parse = ({ tokens, lines = [], index = 0 } = {}) => {
  const line = lines[index];
  const matchResult = line.match(THEMATIC_BREAK_REGEXP);

  if (matchResult) {
    return [
      ...tokens,
      {
        type: "thematic-break",
        prefix: getOr("", 1)(matchResult),
        text: getOr("", 2)(matchResult),
        suffix: getOr("", 6)(matchResult)
      }
    ];
  } else {
    return null;
  }
};

export default { name: "thematic-break", parse };
