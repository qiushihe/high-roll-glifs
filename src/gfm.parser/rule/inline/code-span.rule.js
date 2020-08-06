import size from "lodash/fp/size";
import isNil from "lodash/fp/isNil";
import constant from "lodash/fp/constant";
import cond from "lodash/fp/cond";
import eq from "lodash/fp/eq";
import stubTrue from "lodash/fp/stubTrue";

import { stringStream } from "/src/util/stream.util";
import { resumeInlineTokens } from "/src/util/parser.util";

import { collectLinesAhead } from "../../look-ahead";

// TODO: Update this to ignore escaped markers
// TODO: Update this to support double markers
const CODE_SPAN_REGEXP = new RegExp("`[^`]*`");

const handleUnmatched = constant([]);

const handleMatched = cond([
  [eq("`"), constant(["code-span", "inline-syntax"])],
  [stubTrue, constant(["code-span"])]
]);

const parse = (line, state, stream) => {
  const { type: lineType } = line;

  if (lineType === "atx-heading-line") {
    const {
      context: {
        atxHeading: { level, text, prefix, suffix }
      }
    } = line;

    const tokens = stringStream(text).mapAllRegExp(
      CODE_SPAN_REGEXP,
      handleUnmatched,
      handleMatched
    );

    return {
      inlineTokens: [
        ...Array(size(prefix)).fill([]),
        ...Array(level).fill([]),
        [],
        ...tokens,
        ...Array(size(suffix)).fill([])
      ],
      inlineContext: {}
    };
  } else if (lineType === "paragraph-line") {
    const resumed = resumeInlineTokens(line, state, "code-span");

    if (!isNil(resumed)) {
      return { inlineTokens: resumed.tokens, inlineContext: resumed.context };
    } else {
      const combinedLines = collectLinesAhead(line, stream, lineType);

      const tokens = stringStream(combinedLines.join("")).mapAllRegExp(
        CODE_SPAN_REGEXP,
        handleUnmatched,
        handleMatched
      );

      return {
        inlineTokens: tokens.slice(0, size(line.context.raw)),
        inlineContext: { restTokens: tokens.slice(size(line.context.raw)) }
      };
    }
  } else {
    return null;
  }
};

export default { name: "code-span", parse };
