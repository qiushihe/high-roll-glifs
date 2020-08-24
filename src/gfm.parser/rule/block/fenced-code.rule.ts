import flow from "lodash/fp/flow";
import trim from "lodash/fp/trim";
import isEmpty from "lodash/fp/isEmpty";
import isNil from "lodash/fp/isNil";
import last from "lodash/fp/last";

import { AdaptedStream } from "../../stream/adapter";
import { FencedCode } from "../../parser/block";

import {
  ParserState,
  ParseBlockRule,
  ParsedBlock,
  LineContextBuilder,
} from "../../parser";

const FENCED_CODE_FENCE_REGEXP = new RegExp(
  "^(\\s{0,3})(((`{3,})(\\s*[^`]*\\s*))|((~{3,})(\\s*[^~]*\\s*)))$",
  "i"
);

const FENCED_CODE_LINE_REGEXP = new RegExp("^.*$", "i");

const getInProgressFencedCode = (
  state: ParserState,
  lineType: string
): FencedCode | null => {
  const previousLine = last(state.previousLines);
  if (previousLine && previousLine.type === lineType) {
    return previousLine.context.fencedCode || null;
  } else {
    return null;
  }
};

// TODO: Use `parseBlock` to only swallow:
//       * paragraph-line
//       * empty-line
//       * blank-line
//       ... and consult spec for more/less/whatnot.

// TODO: Add a `restLines` array into the state so we don't have to re-parse all the remaining
//       lines for each remaining line.

const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock | null => {
  const lineType = "fenced-code-line";
  const fenceMatch = stream.match(FENCED_CODE_FENCE_REGEXP);
  const inProgressFencedCode = getInProgressFencedCode(state, lineType);

  // If the current line matches a fence ...
  if (fenceMatch) {
    const lineText = fenceMatch[0] || "";
    const fenceCharacter = (fenceMatch[4] || fenceMatch[7])[0] || "";
    const infoString = fenceMatch[5] || fenceMatch[8] || "";

    // ... and we're already in a code block ...
    if (!isNil(inProgressFencedCode)) {
      const {
        info: inProgressInfo,
        fence: inProgressFence,
      } = inProgressFencedCode;

      // End-fence differs from the start-fence in that it's not possible for the end-fence
      // to have info string. So if we see a fence line without info string, then that fence
      // line  **could be** a end-fence. We just have to check to make sure in later lines.
      const couldBeEnd = flow([trim, isEmpty])(infoString);

      // ... and the fence we just matched could be an end fence ...
      if (couldBeEnd) {
        // ... and it is an end fence for the in progress code block ...
        if (fenceCharacter === inProgressFence) {
          // ... then end the in progress code block.
          const lineContext = LineContextBuilder.new(lineText)
            .fencedCode(inProgressInfo, inProgressFence, false)
            .build();

          return {
            lineType,
            lineContext,
            inlineTokens: [],
            restInlineTokens: [],
          };
        }
        // ... but it's not an end fence for the in progress code block ...
        else {
          // ... then continue the in progress code block.
          const lineContext = LineContextBuilder.new(lineText)
            .fencedCode(inProgressInfo, inProgressFence, true)
            .build();

          return {
            lineType,
            lineContext,
            inlineTokens: [],
            restInlineTokens: [],
          };
        }
      }
      // ... but the fence we just matched could not be an end fence ...
      else {
        // ... then continue the in progress code block.
        const lineContext = LineContextBuilder.new(lineText)
          .fencedCode(inProgressInfo, inProgressFence, true)
          .build();

        return {
          lineType,
          lineContext,
          inlineTokens: [],
          restInlineTokens: [],
        };
      }
    }
    // ... but we're not already in a code block ...
    else {
      // ... then start a code block.
      const lineContext = LineContextBuilder.new(lineText)
        .fencedCode(infoString, fenceCharacter, true)
        .build();

      return {
        lineType,
        lineContext,
        inlineTokens: [],
        restInlineTokens: [],
      };
    }
  } else {
    // If:
    // * The current doesn't match a fence; AND ...
    // * We are inside a fenced code block; AND ...
    if (!isNil(inProgressFencedCode)) {
      const {
        info: inProgressInfo,
        fence: inProgressFence,
        isContinuable: inProgressIsContinuable,
      } = inProgressFencedCode;

      // * The fenced code block has not ended ...
      if (inProgressIsContinuable) {
        // ... then consume any other line for the in-progress fenced code block.
        const lineMatch = stream.match(FENCED_CODE_LINE_REGEXP);

        if (lineMatch) {
          const lineText = lineMatch[0] || "";
          const lineContext = LineContextBuilder.new(lineText)
            .fencedCode(
              inProgressInfo,
              inProgressFence,
              inProgressIsContinuable
            )
            .build();

          return {
            lineType,
            lineContext,
            inlineTokens: [],
            restInlineTokens: [],
          };
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
};

export default { name: "fenced-code", parse };
