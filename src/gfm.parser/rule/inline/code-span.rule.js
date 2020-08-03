import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import reduce from "lodash/fp/reduce";
import get from "lodash/fp/get";

const parseText = flow([
  reduce(
    ({ tokens, state }, character) => {
      const { inSpan, spanLength } = state;

      if (character === "`") {
        if (inSpan) {
          return {
            tokens: [
              ...tokens.slice(0, tokens.length - spanLength),
              ["code-span", "inline-syntax"],
              ...Array(spanLength - 1).fill(["code-span"]),
              ["code-span", "inline-syntax"]
            ],
            state: { ...state, inSpan: false, spanLength: 0 }
          };
        } else {
          return {
            tokens: [...tokens, []],
            state: { ...state, inSpan: true, spanLength: 1 }
          };
        }
      } else {
        if (inSpan) {
          return {
            tokens: [...tokens, []],
            state: { ...state, spanLength: spanLength + 1 }
          };
        } else {
          return { tokens: [...tokens, []], state };
        }
      }
    },
    { tokens: [], state: {} }
  ),
  get("tokens")
]);

const parse = ({ lineType, lineContext }) => {
  if (lineType === "atx-heading-line") {
    const {
      atxHeading: { level, text, prefix, suffix }
    } = lineContext;

    return [
      ...Array(size(prefix)).fill([]),
      ...Array(level).fill([]),
      [],
      ...parseText(text),
      ...Array(size(suffix)).fill([])
    ];
  } else if (lineType === "paragraph-line") {
    const { raw } = lineContext;
    return parseText(raw);
  } else {
    return null;
  }
};

export default { name: "code-span", parse };
