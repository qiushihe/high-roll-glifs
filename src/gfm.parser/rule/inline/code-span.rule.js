import size from "lodash/fp/size";
import isNil from "lodash/fp/isNil";
import constant from "lodash/fp/constant";

import { stringStream } from "/src/util/stream.util";
import { resumeInlineTokens } from "/src/util/parser.util";

import { collectLinesAhead } from "../../look-ahead";

const CODE_SPAN_REGEXP = new RegExp(
  "((?<!(?<!\\\\)`)((?<!\\\\)`)+(?![`]))(.+?)((?<![`])\\1(?![`]))"
);

const handleUnmatched = constant([]);

const handleMatched = (character, index, matchResult) => {
  const openLength = size(matchResult[1]);
  const textLength = size(matchResult[3]);
  const closeLength = size(matchResult[4]);

  if (index < openLength) {
    return ["code-span", "inline-syntax"];
  } else if (
    index >= openLength + textLength &&
    index < openLength + textLength + closeLength
  ) {
    return ["code-span", "inline-syntax"];
  } else {
    return ["code-span"];
  }
};

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
