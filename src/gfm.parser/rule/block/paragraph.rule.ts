import { PARAGRAPH_BLOCK } from "./type";
import { PARAGRAPH_LINE } from "../line/type";
import { AdaptedStream } from "../../stream/adapter";

import {
  ParseBlockRule,
  ParsedBlock,
  BlockContext,
  BlockContextBuilder,
  parseLine,
  parseInlineLines
} from "../../parser";

const collectLines = (blockContext: BlockContext, stream: AdaptedStream) => {
  const lines: string[] = [];

  let lookAheadOffset = 1;

  while (true) {
    const lookAheadStream = stream.slice(lookAheadOffset);

    if (lookAheadStream.ended()) {
      break;
    }

    const parsedLine = parseLine(lookAheadStream.text());
    const parsedLineTypes = parsedLine.getTypes();
    const paragraphLine = parsedLine.getLineByType(PARAGRAPH_LINE);

    if (
      paragraphLine &&
      paragraphLine.context.paragraph &&
      parsedLineTypes.length === 1
    ) {
      lines.push(paragraphLine.context.raw);
      lookAheadOffset += 1;
    } else {
      break;
    }
  }

  return lines;
};

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const paragraphLine = parseLine(stream.text()).getLineByType(PARAGRAPH_LINE);

  if (paragraphLine) {
    const restLines = collectLines(
      BlockContextBuilder.new(paragraphLine.context.raw).paragraph().build(),
      stream
    );

    const rawLines = [paragraphLine.context.raw, ...restLines];

    const inlineTokens: string[][][] = parseInlineLines(rawLines);

    for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
      const lineText = rawLines[lineIndex];

      blockTokens.push({
        type: PARAGRAPH_BLOCK,
        context: BlockContextBuilder.new(lineText).paragraph().build(),
        inlineTokens: inlineTokens[lineIndex]
      });
    }
  }

  return blockTokens;
};

export default { name: "paragraph", parse };
