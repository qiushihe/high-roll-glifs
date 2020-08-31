import {
  ParserState,
  ParseBlockRule,
  ParsedBlock,
  LineContext,
  LineContextBuilder,
  parseBlock,
  parseInlineLines,
  shouldParseContinuationLines,
  shouldParseInlineTokens
} from "../../parser";

import { BLOCK_QUOTE_LINE, PARAGRAPH_LINE } from "./lineType";
import { AdaptedStream } from "../../stream/adapter";

const BLOCK_QUOTE_REGEXP = new RegExp("^(\\s{0,3}>\\s?)(.*)$", "i");

const collectLines = (
  lineContext: LineContext,
  stream: AdaptedStream
): string[][] => {
  const lines: string[][] = [];

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
        lines.push(["", blockLineContext.raw]);
        lookAheadOffset += 1;
      } else if (blockLineType === BLOCK_QUOTE_LINE) {
        if (blockLineContext.blockQuote) {
          lines.push([
            blockLineContext.blockQuote.prefix,
            blockLineContext.blockQuote.text
          ]);
          lookAheadOffset += 1;
        } else {
          break;
        }
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
  const lineMatch = stream.match(BLOCK_QUOTE_REGEXP);

  // If the current line match a blockquote line ...
  if (lineMatch) {
    const lineMatchRaw = lineMatch[0] || "";
    const lineMatchPrefix = lineMatch[1] || "";
    const lineMatchText = lineMatch[2] || "";

    // ... then optionally collect all continuation lines ahead.
    const restLines = shouldParseContinuationLines(state)
      ? collectLines(
          LineContextBuilder.new(lineMatchRaw)
            .blockQuote(lineMatchPrefix, lineMatchText)
            .build(),
          stream
        )
      : [];

    // Re-constitute the list of raw lines to include the current line.
    // The "current line" used here is only the value of the "text" component of the
    // blockquote (i.e. without the "prefix" component) because when parsing inline tokens
    // we don't want to parse the "prefix" component.
    const rawLines = [[lineMatchPrefix, lineMatchText], ...restLines];

    const inlineLines = rawLines.map((line) => line[1]);

    // Parse the list of raw lines for inline tokens.
    const inlineTokens: string[][][] = shouldParseInlineTokens(state)
      ? parseInlineLines(inlineLines)
      : [];

    // For each raw line ...
    for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
      const linePrefix = rawLines[lineIndex][0];
      const lineText = rawLines[lineIndex][1];
      const lineRaw = `${linePrefix}${lineText}`;

      blockTokens.push({
        lineType: BLOCK_QUOTE_LINE,
        // ... with both prefix and text of the blockquote.
        lineContext: LineContextBuilder.new(lineRaw)
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
