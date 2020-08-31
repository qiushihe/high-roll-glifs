import {
  ParseBlockRule,
  ParsedBlock,
  ParserState,
  LineContext,
  LineContextBuilder,
  parseInlineLines,
  shouldParseContinuationLines,
  shouldParseInlineTokens
} from "../../parser";

import { PARAGRAPH_LINE } from "./lineType";
import { AdaptedStream } from "../../stream/adapter";
import { parse as parseBlock } from "../../parser/block.parser";

const PARAGRAPH_LINE_REGEXP = new RegExp("^(\\s*[^\\s]+\\s*)+$", "i");

const collectLines = (lineContext: LineContext, stream: AdaptedStream) => {
  const lines: string[] = [];

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

      if (blockLineType === PARAGRAPH_LINE) {
        lines.push(blockLineContext.raw);
        lookAheadOffset += 1;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return lines;
};

const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const lineMatch = stream.match(PARAGRAPH_LINE_REGEXP);

  if (lineMatch) {
    const lineMatchRaw = lineMatch[0] || "";
    const restLines = shouldParseContinuationLines(state)
      ? collectLines(
          LineContextBuilder.new(lineMatchRaw).paragraph().build(),
          stream
        )
      : [];

    const rawLines = [lineMatchRaw, ...restLines];

    const inlineTokens: string[][][] = shouldParseInlineTokens(state)
      ? parseInlineLines(rawLines)
      : [];

    for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
      const lineText = rawLines[lineIndex];

      blockTokens.push({
        lineType: PARAGRAPH_LINE,
        lineContext: LineContextBuilder.new(lineText).paragraph().build(),
        inlineTokens: inlineTokens[lineIndex]
      });
    }
  }

  return blockTokens;
};

export default { name: "paragraph", parse };
