import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import times from "lodash/fp/times";
import constant from "lodash/fp/constant";

const parse = ({ lineType, lineContext }) => {
  if (lineType === "atx-heading-line") {
    const {
      atxHeading: { level, text, prefix, suffix }
    } = lineContext;

    return [
      ...flow([size, times(constant(["block-syntax"]))])(prefix),
      ...times(constant(["block-syntax"]))(level),
      ...times(constant(["block-syntax"]))(1),
      ...flow([size, times(constant([]))])(text),
      ...flow([size, times(constant(["block-syntax"]))])(suffix)
    ];
  } else {
    return null;
  }
};

export default { name: "markdown-syntax", parse };
