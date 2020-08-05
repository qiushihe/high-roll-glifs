import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import isEmpty from "lodash/fp/isEmpty";
import isNil from "lodash/fp/isNil";
import get from "lodash/fp/get";
import last from "lodash/fp/last";
import constant from "lodash/fp/constant";
import cond from "lodash/fp/cond";
import eq from "lodash/fp/eq";
import stubTrue from "lodash/fp/stubTrue";

import { stringStream } from "/src/util/stream.util";

import { adaptString } from "../../line.adapter";
import { parseBlock } from "../../block.parser";

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
      atxHeading: { level, text, prefix, suffix }
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
    const { raw } = line;
    const lineSize = size(raw);

    const restInlineTokens = flow([
      get("previousLines"),
      last,
      get("inline.restTokens")
    ])(state);

    if (!isEmpty(restInlineTokens)) {
      const restInlineTokensCount = size(restInlineTokens);

      // This shouldn't happen in theory (maybe it can happen under certain race conditions during
      // active parsing cycles, I donno) ...
      if (lineSize > restInlineTokensCount) {
        return {
          inlineTokens: [
            ...restInlineTokens,
            ...Array(lineSize - restInlineTokensCount).fill([])
          ],
          inlineContext: { restTokens: [] }
        };
      } else {
        return {
          inlineTokens: restInlineTokens.slice(0, lineSize),
          inlineContext: { restTokens: restInlineTokens.slice(lineSize) }
        };
      }
    } else {
      let combinedLines = [raw];
      let lookAhead = 1;

      while (true) {
        const lookAheadText = stream.lookAhead(lookAhead);

        if (isNil(lookAheadText)) {
          break;
        }

        const { lineType: lookAheadLineType } = parseBlock(
          adaptString(lookAheadText),
          { previousLines: [{ ...line, raw: last(combinedLines) }] }
        );

        if (lookAheadLineType === "paragraph-line") {
          combinedLines = [...combinedLines, lookAheadText];
        } else {
          break;
        }

        lookAhead += 1;
      }

      const tokens = stringStream(combinedLines.join("")).mapAllRegExp(
        CODE_SPAN_REGEXP,
        handleUnmatched,
        handleMatched
      );

      return {
        inlineTokens: tokens.slice(0, lineSize),
        inlineContext: { restTokens: tokens.slice(lineSize) }
      };
    }
  } else {
    return null;
  }
};

export default { name: "code-span", parse };
