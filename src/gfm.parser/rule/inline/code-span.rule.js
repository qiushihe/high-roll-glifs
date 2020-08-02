import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import times from "lodash/fp/times";
import constant from "lodash/fp/constant";
import reduce from "lodash/fp/reduce";
import get from "lodash/fp/get";

const parse = ({ lineType, lineContext }) => {
  if (lineType === "atx-heading-line") {
    const {
      atxHeading: { level, text, prefix, suffix }
    } = lineContext;

    return [
      ...flow([size, times(constant([]))])(prefix),
      ...times(constant([]))(level),
      ...times(constant([]))(1),
      ...flow([
        reduce(
          ({ tokens, state }, character) => {
            const { inSpan } = state;

            if (character === "`") {
              if (inSpan) {
                return {
                  tokens: [...tokens, ["code-span"]],
                  state: { ...state, inSpan: false }
                };
              } else {
                return {
                  tokens: [...tokens, ["code-span"]],
                  state: { ...state, inSpan: true }
                };
              }
            } else {
              if (inSpan) {
                return {
                  tokens: [...tokens, ["code-span"]],
                  state
                };
              } else {
                return {
                  tokens: [...tokens, []],
                  state
                };
              }
            }
          },
          { tokens: [], state: {} }
        ),
        get("tokens")
      ])(text),
      ...flow([size, times(constant([]))])(suffix)
    ];
  } else {
    return null;
  }
};

export default { name: "code-span", parse };
