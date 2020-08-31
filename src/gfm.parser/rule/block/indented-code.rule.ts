import {
  ParserState,
  ParseBlockRule,
  ParsedBlock,
  LineContext,
  LineContextBuilder,
  parseBlock,
  shouldParseContinuationLines
} from "../../parser";

import { INDENTED_CODE_LINE } from "./lineType";
import { AdaptedStream } from "../../stream/adapter";

const INDENTED_CODE_REGEXP = new RegExp("^\\s{4}(.+)$", "i");

const collectLines = (
  lineContext: LineContext,
  stream: AdaptedStream
): string[] => {
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

      if (blockLineType === INDENTED_CODE_LINE) {
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
  const lineMatch = stream.match(INDENTED_CODE_REGEXP);

  if (lineMatch) {
    const lineMatchRaw = lineMatch[0] || "";

    const restLines = shouldParseContinuationLines(state)
      ? collectLines(
          LineContextBuilder.new(lineMatchRaw).indentedCode().build(),
          stream
        )
      : [];

    const rawLines = [lineMatchRaw, ...restLines];

    for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
      const lineText = rawLines[lineIndex];

      blockTokens.push({
        lineType: INDENTED_CODE_LINE,
        lineContext: LineContextBuilder.new(lineText).indentedCode().build(),
        inlineTokens: []
      });
    }
  }

  return blockTokens;
};

export default { name: "indented-code", parse };
