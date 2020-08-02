import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import getOr from "lodash/fp/getOr";
import size from "lodash/fp/size";

const ATX_HEADING_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})(#{1,6})(\\s(.*?))?(\\s+#+\\s*)?$",
  "i"
);

const parse = adaptedLine => {
  const lineMatch = adaptedLine.match(ATX_HEADING_LINE_REGEXP);

  if (lineMatch) {
    return {
      lineType: "atx-heading-line",
      lineContext: {
        raw: lineMatch[0],
        atxHeading: {
          level: flow([get(2), size])(lineMatch),
          text: getOr("", 4)(lineMatch),
          prefix: getOr("", 1)(lineMatch),
          suffix: getOr("", 5)(lineMatch)
        }
      }
    };
  } else {
    return null;
  }
};

export default { name: "atx-heading", parse };
