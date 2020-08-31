import trim from "lodash/fp/trim";

import {
  ParserState,
  ParseBlockRule,
  ParsedBlock,
  LineContext,
  LineContextBuilder,
  parseBlock,
  shouldParseInlineTokens,
  parseInlineLines
} from "../../parser";

import {
  SETTEXT_HEADING_LINE,
  PARAGRAPH_LINE,
  THEMATIC_BREAK_LINE,
  BULLET_LIST_LINE
} from "./lineType";
import { AdaptedStream } from "../../stream/adapter";

const SETTEXT_HEADING_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})(([^\\s]\\s*?)+)(\\s*)$",
  "i"
);

const SETTEXT_HEADING_UNDERLINE_REGEXP = new RegExp(
  "^(\\s{0,3})((-+)|(=+))(\\s*)$",
  "i"
);

const collectLines = (
  lineContext: LineContext,
  stream: AdaptedStream
): string[] => {
  const lines: string[] = [];
  let foundUnderline = false;

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
      const {
        lineType: blockLineType,
        lineContext: blockLineContext
      } = blocks[0];

      if (
        blockLineType === PARAGRAPH_LINE ||
        blockLineType === THEMATIC_BREAK_LINE ||
        blockLineType === SETTEXT_HEADING_LINE ||
        blockLineType === BULLET_LIST_LINE
      ) {
        lines.push(blockLineContext.raw);
        lookAheadOffset += 1;

        if (blockLineContext.raw.match(SETTEXT_HEADING_UNDERLINE_REGEXP)) {
          foundUnderline = true;
          break;
        }
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return foundUnderline ? lines : [];
};

const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const lineMatch = stream.match(SETTEXT_HEADING_LINE_REGEXP);

  if (lineMatch) {
    const lineText = lineMatch[0] || "";
    const prefix = lineMatch[1] || "";
    const text = lineMatch[2] || "";
    const suffix = lineMatch[4] || "";

    const restLines = collectLines(
      LineContextBuilder.new(lineText)
        .settextHeading(prefix, text, suffix, 0, false)
        .build(),
      stream
    );

    if (restLines.length > 0) {
      const rawLines = [lineText, ...restLines];
      const level = trim(rawLines[rawLines.length - 1]).match(/=/) ? 1 : 2;

      const inlineLines = rawLines.slice(0, rawLines.length - 1);

      const inlineTokens: string[][][] = shouldParseInlineTokens(state)
        ? parseInlineLines(inlineLines)
        : [];

      for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
        const lineText = rawLines[lineIndex];

        blockTokens.push({
          lineType: SETTEXT_HEADING_LINE,
          lineContext: LineContextBuilder.new(lineText)
            .settextHeading(
              prefix,
              text,
              suffix,
              level,
              lineIndex === rawLines.length - 1
            )
            .build(),
          inlineTokens:
            lineIndex === rawLines.length - 1 ? [] : inlineTokens[lineIndex]
        });
      }
    }
  }

  return blockTokens;
};

export default { name: "settext-heading", parse };
