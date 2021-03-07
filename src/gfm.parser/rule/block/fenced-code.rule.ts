import { FENCED_CODE_BLOCK } from "./type";
import { FENCED_CODE_FENCE_LINE } from "../line/type";
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
  let foundClosingFence = false;

  let lookAheadOffset = 1;

  while (true) {
    const lookAheadStream = stream.slice(lookAheadOffset);

    if (lookAheadStream.ended()) {
      break;
    }

    const parsedLine = parseLine(lookAheadStream.text());
    const parsedLineTypes = parsedLine.getTypes();

    if (parsedLineTypes.length > 0) {
      lines.push(parsedLine.getRaw());
      lookAheadOffset += 1;

      const fencedCodeFenceLine = parsedLine.getLineByType(
        FENCED_CODE_FENCE_LINE
      );
      if (fencedCodeFenceLine && fencedCodeFenceLine.context.fencedCodeFence) {
        foundClosingFence = true;
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
  const fencedCodeFenceLine = parseLine(stream.text()).getLineByType(
    FENCED_CODE_FENCE_LINE
  );

  if (fencedCodeFenceLine && fencedCodeFenceLine.context.fencedCodeFence) {
    const rawText = fencedCodeFenceLine.context.raw;
    const fencedCodeFence = fencedCodeFenceLine.context.fencedCodeFence;

    // The collection of "rest lines" should not be predicated on calling
    // the `shouldParseContinuationLines` function because the:
    // * opening fence
    // * code lines
    // * closing fence
    // ... collectively counts as a singular "fenced code block". This means they
    // are not continuation lines and thus not controlled by the continuation lines
    // parsing flag.
    const restLines = collectLines(
      BlockContextBuilder.new(rawText)
        .fencedCode(fencedCodeFence.info, true, false)
        .build(),
      stream
    );

    if (restLines.length > 0) {
      const rawLines = [rawText, ...restLines];

      for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
        const lineText = rawLines[lineIndex];

        blockTokens.push({
          type: FENCED_CODE_BLOCK,
          context: BlockContextBuilder.new(lineText)
            .fencedCode(
              fencedCodeFence.info,
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
