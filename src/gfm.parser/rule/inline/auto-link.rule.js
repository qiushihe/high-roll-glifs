import size from "lodash/fp/size";
import isNil from "lodash/fp/isNil";
import constant from "lodash/fp/constant";
import cond from "lodash/fp/cond";
import eq from "lodash/fp/eq";
import stubTrue from "lodash/fp/stubTrue";

import { stringStream } from "/src/util/stream.util";

import { resumeInlineTokens } from "../../../util/parser.util";
import { collectLinesAhead } from "../../look-ahead";

// TODO: Make this expression great again.
const AUTO_LINK_REGEXP = new RegExp("<([^>]*)>");

const handleUnmatched = constant([]);

const handleMatched = cond([
  [eq("<"), constant(["link", "inline-syntax"])],
  [eq(">"), constant(["link", "inline-syntax"])],
  [stubTrue, constant(["link"])]
]);

const parse = (line, state, stream) => {
  const { type: lineType } = line;

  if (lineType === "atx-heading-line") {
    const {
      atxHeading: { level, text, prefix, suffix }
    } = line;

    const tokens = stringStream(text).mapAllRegExp(
      AUTO_LINK_REGEXP,
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
    const resumed = resumeInlineTokens(line, state, "auto-link");

    if (!isNil(resumed)) {
      return { inlineTokens: resumed.tokens, inlineContext: resumed.context };
    } else {
      const combinedLines = collectLinesAhead(line, stream, lineType);

      const tokens = stringStream(combinedLines.join("")).mapAllRegExp(
        AUTO_LINK_REGEXP,
        handleUnmatched,
        handleMatched
      );

      return {
        inlineTokens: tokens.slice(0, size(line.raw)),
        inlineContext: { restTokens: tokens.slice(size(line.raw)) }
      };
    }
  } else {
    return null;
  }
};

export default { name: "auto-link", parse };
