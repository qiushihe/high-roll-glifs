import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import getOr from "lodash/fp/getOr";
import size from "lodash/fp/size";

const ATX_HEADING_REGEXP = new RegExp(
  "^(\\s{0,3})(#{1,6})(\\s(.*?))?(\\s+#+\\s*)?$"
);

const parse = ({ tokens, lines = [], index = 0 } = {}) => {
  const line = lines[index];
  const matchResult = line.match(ATX_HEADING_REGEXP);

  if (matchResult) {
    return [
      ...tokens,
      {
        type: "atx-heading",
        level: flow([get(2), size])(matchResult),
        text: getOr("", 4)(matchResult),
        prefix: getOr("", 1)(matchResult),
        suffix: getOr("", 5)(matchResult)
      }
    ];
  } else {
    return null;
  }
};

export default { name: "atx-heading", parse };
