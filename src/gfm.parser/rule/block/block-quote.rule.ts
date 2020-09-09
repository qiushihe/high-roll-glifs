import { BLOCK_QUOTE_BLOCK } from "./type";
import { BLOCK_QUOTE_LINE, PARAGRAPH_LINE } from "../line/type";
import { AdaptedStream } from "../../stream/adapter";

import {
  ParseBlockRule,
  ParsedBlock,
  BlockContext,
  BlockContextBuilder,
  parseLine,
  parseInlineLines
} from "../../parser";

const collectLines = (
  lineContext: BlockContext,
  stream: AdaptedStream
): string[][] => {
  const lines: string[][] = [];

  let lookAheadOffset = 1;

  while (true) {
    const lookAheadStream = stream.slice(lookAheadOffset);

    if (lookAheadStream.ended()) {
      break;
    }

    const parsedLine = parseLine(lookAheadStream.text());
    const parsedLineTypes = parsedLine.getTypes();
    const paragraphLine = parsedLine.getLineByType(PARAGRAPH_LINE);
    const blockQuoteLine = parsedLine.getLineByType(BLOCK_QUOTE_LINE);

    if (
      paragraphLine &&
      paragraphLine.context.paragraph &&
      parsedLineTypes.length === 1
    ) {
      const rawText = paragraphLine.context.raw;

      lines.push(["", rawText]);
      lookAheadOffset += 1;
    } else if (blockQuoteLine && blockQuoteLine.context.blockQuote) {
      const blockQuote = blockQuoteLine.context.blockQuote;

      lines.push([blockQuote.prefix, blockQuote.text]);
      lookAheadOffset += 1;
    } else {
      break;
    }
  }

  return lines;
};

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const blockQuoteLine = parseLine(stream.text()).getLineByType(
    BLOCK_QUOTE_LINE
  );

  // If the current line match a blockquote line ...
  if (blockQuoteLine && blockQuoteLine.context.blockQuote) {
    const rawText = blockQuoteLine.context.raw;
    const blockQuote = blockQuoteLine.context.blockQuote;

    // ... then optionally collect all continuation lines ahead.
    const restLines = collectLines(
      BlockContextBuilder.new(rawText)
        .blockQuote(blockQuote.prefix, blockQuote.text)
        .build(),
      stream
    );

    // Re-constitute the list of raw lines to include the current line.
    // The "current line" used here is only the value of the "text" component of the
    // blockquote (i.e. without the "prefix" component) because when parsing inline tokens
    // we don't want to parse the "prefix" component.
    const rawLines = [[blockQuote.prefix, blockQuote.text], ...restLines];

    const inlineLines = rawLines.map((line) => line[1]);

    // Parse the list of raw lines for inline tokens.
    const inlineTokens: string[][][] = parseInlineLines(inlineLines);

    // For each raw line ...
    for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
      const linePrefix = rawLines[lineIndex][0];
      const lineText = rawLines[lineIndex][1];
      const lineRaw = `${linePrefix}${lineText}`;

      blockTokens.push({
        type: BLOCK_QUOTE_BLOCK,
        // ... with both prefix and text of the blockquote.
        context: BlockContextBuilder.new(lineRaw)
          .blockQuote(linePrefix, lineText)
          .build(),

        // Because the inline tokens for the first line was generated without
        // the `prefix` component of the blockquote, we have to pad
        // the `inlineTokens[lineIndex]` array with a number of block syntax arrays equal
        // to the length of the `lineMatchPrefix` string.
        inlineTokens: [
          ...Array(linePrefix.length).fill([
            "blockquote-prefix",
            "block-syntax"
          ]),
          ...(inlineTokens[lineIndex] || [])
        ]
      });
    }
  }

  return blockTokens;
};

export default { name: "block-quote", parse };
