import size from "lodash/fp/size";
import isNil from "lodash/fp/isNil";
import constant from "lodash/fp/constant";
import cond from "lodash/fp/cond";
import eq from "lodash/fp/eq";
import stubTrue from "lodash/fp/stubTrue";

import { stringStream } from "/src/util/stream.util";

import {
  AdaptedStream,
  LineState,
  ParsedInline,
  ParseInlineRule,
  ParserState
} from "../../type";
import { collectLinesAhead, resumeInlineTokens } from "../../gfm.parser";

// TODO: Make this expression great again.
const AUTO_LINK_REGEXP = new RegExp("<([^>]*)>");

const handleUnmatched = constant([]);

const handleMatched = cond([
  [eq("<"), constant(["link-span", "inline-syntax"])],
  [eq(">"), constant(["link-span", "inline-syntax"])],
  [stubTrue, constant(["link-span"])]
]);

const parse: ParseInlineRule = (
  line: LineState,
  state: ParserState,
  stream: AdaptedStream
): ParsedInline | null => {
  const { type: lineType } = line;

  if (lineType === "atx-heading-line") {
    const {
      context: { atxHeading }
    } = line;

    if (atxHeading) {
      const { level, text, prefix, suffix } = atxHeading;

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
    } else {
      return null;
    }
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
        inlineTokens: tokens.slice(0, size(line.context.raw)),
        inlineContext: { restTokens: tokens.slice(size(line.context.raw)) }
      };
    }
  } else {
    return null;
  }
};

export default { name: "auto-link", parse };
