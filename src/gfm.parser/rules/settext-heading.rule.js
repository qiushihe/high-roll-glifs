import getOr from "lodash/fp/getOr";
import size from "lodash/fp/size";
import map from "lodash/fp/map";
import isEmpty from "lodash/fp/isEmpty";

const SETTEXT_HEADING_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})(([^\\s]\\s*?)+)(\\s*)$"
);

const SETTEXT_HEADING_UNDERLINE_REGEXP = new RegExp(
  "^(\\s{0,3})((-+)|(=+))(\\s*)$"
);

const parse = ({ tokens, lines = [], index = 0 } = {}) => {
  const line = lines[index];

  let precedingTokens = [];
  let reverseTokenIndex = size(tokens) - 1;

  while (true) {
    if (reverseTokenIndex < 0) {
      break;
    }

    const token = tokens[reverseTokenIndex];

    if (
      token.type === "paragraph" &&
      token.text.match(SETTEXT_HEADING_LINE_REGEXP)
    ) {
      // Insert token at the front because this loop is iterating over
      // the tokens in reversed order.
      precedingTokens = [token, ...precedingTokens];
    } else {
      break;
    }

    reverseTokenIndex -= 1;
  }

  const underlineMatch = line.match(SETTEXT_HEADING_UNDERLINE_REGEXP);

  if (!isEmpty(precedingTokens) && underlineMatch) {
    const level = line.indexOf("=") >= 0 ? 1 : 2;
    return [
      ...tokens.slice(0, size(tokens) - size(precedingTokens)),
      ...map(precedingToken => ({
        ...precedingToken,
        type: "settext-heading",
        isUnderline: false,
        level
      }))(precedingTokens),
      {
        type: "settext-heading",
        isUnderline: true,
        level,
        prefix: getOr("", 1)(underlineMatch),
        text: getOr("", 2)(underlineMatch),
        suffix: getOr("", 5)(underlineMatch)
      }
    ];
  } else {
    return null;
  }
};

export default { name: "settext-heading", parse };
