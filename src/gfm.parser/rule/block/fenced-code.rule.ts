import {
  ParseBlockRule,
  ParsedBlock,
  LineContext,
  LineContextBuilder,
  parseBlock
} from "../../parser";

import {
  FENCED_CODE_LINE,
  PARAGRAPH_LINE,
  BLANK_LINE,
  EMPTY_LINE
} from "./lineType";

import { AdaptedStream } from "../../stream/adapter";

const FENCED_CODE_FENCE_REGEXP = new RegExp(
  "^(\\s{0,3})(((`{3,})(\\s*[^`]*\\s*))|((~{3,})(\\s*[^~]*\\s*)))$",
  "i"
);

const collectLines = (
  lineContext: LineContext,
  stream: AdaptedStream
): string[] => {
  const lines: string[] = [];
  let foundClosingFence = false;

  let lookAheadOffset = 1;

  while (true) {
    const lookAheadStream = stream.slice(lookAheadOffset);

    if (lookAheadStream.ended()) {
      break;
    }

    const blocks = parseBlock(lookAheadStream, {
      context: { skipInlineTokens: true, skipContinuationLines: true }
    });

    if (blocks.length > 0) {
      const block = blocks[blocks.length - 1];
      const { lineType: blockLineType, lineContext: blockLineContext } = block;

      if (
        blockLineType === PARAGRAPH_LINE ||
        blockLineType === BLANK_LINE ||
        blockLineType === EMPTY_LINE
      ) {
        lines.push(blockLineContext.raw);
        lookAheadOffset += 1;

        if (blockLineContext.raw.match(FENCED_CODE_FENCE_REGEXP)) {
          foundClosingFence = true;
          break;
        }
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return foundClosingFence ? lines : [];
};

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const lineMatch = stream.match(FENCED_CODE_FENCE_REGEXP);

  if (lineMatch) {
    const lineMatchRaw = lineMatch[0] || "";
    const lineMatchInfo = lineMatch[5] || lineMatch[8] || "";

    // The collection of "rest lines" should not be predicated on calling
    // the `shouldParseContinuationLines` function because the:
    // * opening fence
    // * code lines
    // * closing fence
    // ... collectively counts as a singular "fenced code block". This means they
    // are not continuation lines and thus not controlled by the continuation lines
    // parsing flag.
    const restLines = collectLines(
      LineContextBuilder.new(lineMatchRaw)
        .fencedCode(lineMatchInfo, true, false)
        .build(),
      stream
    );

    if (restLines.length > 0) {
      const rawLines = [lineMatchRaw, ...restLines];

      for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
        const lineText = rawLines[lineIndex];

        blockTokens.push({
          lineType: FENCED_CODE_LINE,
          lineContext: LineContextBuilder.new(lineText)
            .fencedCode(
              lineMatchInfo,
              lineIndex === 0,
              lineIndex === rawLines.length - 1
            )
            .build(),
          inlineTokens: []
        });
      }
    }
  }

  return blockTokens;
};

export default { name: "fenced-code", parse };
