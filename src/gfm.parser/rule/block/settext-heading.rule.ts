import trim from "lodash/fp/trim";

import { AdaptedStream } from "../../stream/adapter";
import { PARAGRAPH_LINE, SETTEXT_HEADING_UNDERLINE_LINE } from "../line/type";
import { SETTEXT_HEADING_BLOCK } from "./type";

import {
  ParseBlockRule,
  ParsedBlock,
  BlockContext,
  BlockContextBuilder,
  parseLine,
  parseInlineLines
} from "../../parser";

interface LineAttributes {
  raw: string;
  prefix: string;
  text: string;
  suffix: string;
}

const collectLines = (
  blockContext: BlockContext,
  stream: AdaptedStream
): LineAttributes[] => {
  const lines: LineAttributes[] = [];
  let foundUnderline = false;

  let lookAheadOffset = 1;

  while (true) {
    const lookAheadStream = stream.slice(lookAheadOffset);

    if (lookAheadStream.ended()) {
      break;
    }

    const parsedLine = parseLine(lookAheadStream.text());
    const parsedLineTypes = parsedLine.getTypes();
    const paragraphLine = parsedLine.getLineByType(PARAGRAPH_LINE);
    const settextHeadingUnderlineLine = parsedLine.getLineByType(
      SETTEXT_HEADING_UNDERLINE_LINE
    );

    if (
      paragraphLine &&
      paragraphLine.context.paragraph &&
      parsedLineTypes.length === 1
    ) {
      const rawText = paragraphLine.context.raw;

      lines.push({ raw: rawText, prefix: "", text: rawText, suffix: "" });
      lookAheadOffset += 1;
    } else if (
      settextHeadingUnderlineLine &&
      settextHeadingUnderlineLine.context.settextHeadingUnderline
    ) {
      const rawText = settextHeadingUnderlineLine.context.raw;
      const settextHeadingUnderline =
        settextHeadingUnderlineLine.context.settextHeadingUnderline;

      lines.push({
        raw: rawText,
        prefix: settextHeadingUnderline.prefix,
        text: settextHeadingUnderline.text,
        suffix: settextHeadingUnderline.suffix
      });
      foundUnderline = true;
      break;
    } else {
      break;
    }
  }

  return foundUnderline ? lines : [];
};

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const parsedLine = parseLine(stream.text());
  const parsedLineTypes = parsedLine.getTypes();
  const paragraphLine = parsedLine.getLineByType(PARAGRAPH_LINE);

  if (
    paragraphLine &&
    paragraphLine.context.paragraph &&
    parsedLineTypes.length === 1
  ) {
    const rawText = paragraphLine.context.raw;

    const restLines = collectLines(
      BlockContextBuilder.new(rawText)
        .settextHeading("", rawText, "", 0, false)
        .build(),
      stream
    );

    if (restLines.length > 0) {
      const allLines: LineAttributes[] = [
        { raw: rawText, prefix: "", text: rawText, suffix: "" },
        ...restLines
      ];
      const level = trim(allLines[allLines.length - 1].text).match(/=/) ? 1 : 2;

      // Lines for inline tokens parsing are all except the last line (which is the underline).
      // Therefore use `line.raw` because prefix/suffix only applies to underline.
      const inlineLines = allLines
        .slice(0, allLines.length - 1)
        .map((line) => line.raw);

      const inlineTokens: string[][][] = parseInlineLines(inlineLines);

      for (let lineIndex = 0; lineIndex < allLines.length; lineIndex++) {
        const rawLine = allLines[lineIndex];

        blockTokens.push({
          type: SETTEXT_HEADING_BLOCK,
          context: BlockContextBuilder.new(rawLine.raw)
            .settextHeading(
              rawLine.prefix,
              rawLine.text,
              rawLine.suffix,
              level,
              lineIndex === allLines.length - 1
            )
            .build(),
          inlineTokens:
            lineIndex === allLines.length - 1 ? [] : inlineTokens[lineIndex]
        });
      }
    }
  }

  return blockTokens;
};

export default { name: "settext-heading", parse };
