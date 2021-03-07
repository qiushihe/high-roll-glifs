import { INDENTED_CODE_BLOCK } from "./type";
import { INDENTED_CODE_LINE } from "../line/type";
import { AdaptedStream } from "../../stream/adapter";

import {
  ParseBlockRule,
  ParsedBlock,
  BlockContext,
  BlockContextBuilder,
  parseLine
} from "../../parser";

const collectLines = (
  blockContext: BlockContext,
  stream: AdaptedStream
): string[] => {
  const lines: string[] = [];

  let lookAheadOffset = 1;

  while (true) {
    const lookAheadStream = stream.slice(lookAheadOffset);

    if (lookAheadStream.ended()) {
      break;
    }

    const indentedCodeLine = parseLine(lookAheadStream.text()).getLineByType(
      INDENTED_CODE_LINE
    );

    if (indentedCodeLine && indentedCodeLine.context.indentedCode) {
      const rawText = indentedCodeLine.context.raw;

      lines.push(rawText);
      lookAheadOffset += 1;
    } else {
      break;
    }
  }

  return lines;
};

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const indentedCodeLine = parseLine(stream.text()).getLineByType(
    INDENTED_CODE_LINE
  );

  if (indentedCodeLine && indentedCodeLine.context.indentedCode) {
    const rawText = indentedCodeLine.context.raw;

    const restLines = collectLines(
      BlockContextBuilder.new(rawText).indentedCode().build(),
      stream
    );

    const rawLines = [rawText, ...restLines];

    for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
      const lineText = rawLines[lineIndex];

      blockTokens.push({
        type: INDENTED_CODE_BLOCK,
        context: BlockContextBuilder.new(lineText).indentedCode().build(),
        inlineTokens: []
      });
    }
  }

  return blockTokens;
};

export default { name: "indented-code", parse };
