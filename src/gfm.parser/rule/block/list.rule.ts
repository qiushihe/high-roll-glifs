import size from "lodash/fp/size";

import {
  ParserState,
  ParseBlockRule,
  ParsedBlock,
  LineContext,
  LineContextBuilder,
  parseBlock,
  shouldParseContinuationLines,
  shouldParseInlineTokens,
  parseInlineLines
} from "../../parser";

import {
  BULLET_LIST_LINE,
  ORDERED_LIST_LINE,
  PARAGRAPH_LINE
} from "./lineType";

import { AdaptedStream } from "../../stream/adapter";

const BULLET_LIST_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})([-+*])(\\s?)(.*)$",
  "i"
);

const ORDERED_LIST_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})([0-9]{1,9})([.)])(\\s?)(.*)$",
  "i"
);

type LineComponents = {
  lineType: string;
  lineText: string;
  prefix: string;
  digits: string;
  marker: string;
  spaces: string;
  content: string;
};

const getLineMatch = (stream: AdaptedStream): LineComponents | null => {
  const bulletLineMatch = stream.match(BULLET_LIST_LINE_REGEXP);
  const orderedLineMatch = stream.match(ORDERED_LIST_LINE_REGEXP);

  if (bulletLineMatch) {
    const lineText = bulletLineMatch[0] || "";
    const prefix = bulletLineMatch[1] || "";
    const marker = bulletLineMatch[2] || "";
    const spaces = bulletLineMatch[3] || "";
    const content = bulletLineMatch[4] || "";

    return {
      lineType: BULLET_LIST_LINE,
      lineText,
      prefix,
      digits: "",
      marker,
      spaces,
      content
    };
  } else if (orderedLineMatch) {
    const lineText = orderedLineMatch[0] || "";
    const prefix = orderedLineMatch[1] || "";
    const digits = orderedLineMatch[2] || "";
    const marker = orderedLineMatch[3] || "";
    const spaces = orderedLineMatch[4] || "";
    const content = orderedLineMatch[5] || "";

    return {
      lineType: ORDERED_LIST_LINE,
      lineText,
      prefix,
      digits,
      marker,
      spaces,
      content
    };
  } else {
    return null;
  }
};

const getLineContext = (lineMatch: LineComponents): LineContext | null => {
  const {
    lineType,
    lineText,
    prefix,
    digits,
    marker,
    spaces,
    content
  } = lineMatch;

  // ... and if `content` is not empty ...
  if (content.length > 0) {
    // ... and `spaces` is also not empty ...
    if (spaces.length > 0) {
      // ... then calculate `leader` to include `spaces`.
      const leader = `${prefix}${digits}${marker}${spaces}`;

      // ... and build the line context with size of `leader`.
      return LineContextBuilder.new(lineText)
        .list(
          lineType === BULLET_LIST_LINE ? "bullet" : "ordered",
          size(leader)
        )
        .build();
    }
    // ... but `spaces` is empty ...
    else {
      // ... then this is not a list item.
      return null;
    }
  }
  // ... if `content` is empty ...
  else {
    // ... then calculate `leader` excluding `spaces`.
    const leader = `${prefix}${digits}${marker}`;

    // ... and build the line context with size of `leader` + 1.
    return (
      LineContextBuilder.new(lineText)
        // The `+ 1` is because even though the list item itself has no content, any lazy
        // continuation lines would still need the extra space added before their content.
        .list(
          lineType === BULLET_LIST_LINE ? "bullet" : "ordered",
          size(leader) + 1
        )
        .build()
    );
  }
};

const collectLines = (
  lineType: string,
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

// TODO: Parse "content" segment as blocks, and if the parsed content turns out to be anything
//       other than "indented code block", then "content" can "give up" certain number of leading
//       spaces so that the "space" segment would have up to 4 spaces.
//       This step needs to be done before the "leader" segment can be determined.

const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const lineMatch = getLineMatch(stream);

  if (lineMatch) {
    const lineContext = getLineContext(lineMatch);

    if (lineContext) {
      const contextList = lineContext.list;

      if (contextList) {
        const { lineType, lineText, content } = lineMatch;

        const restLines = shouldParseContinuationLines(state)
          ? collectLines(lineType, lineContext, stream)
          : [];

        const inlineLines = [content, ...restLines];

        const inlineTokens: string[][][] = shouldParseInlineTokens(state)
          ? parseInlineLines(inlineLines)
          : [];

        const rawLines: [number, string][] = [
          [contextList.leader, lineText],
          ...(restLines.map((text) => [0, text]) as [number, string][])
        ];

        for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
          const lineLeader = rawLines[lineIndex][0];
          const lineText = rawLines[lineIndex][1];

          blockTokens.push({
            lineType,
            lineContext: LineContextBuilder.new(lineText)
              .list(contextList.type, contextList.leader)
              .build(),
            inlineTokens: [
              ...Array(lineLeader).fill(["list-leader", "block-syntax"]),
              ...(inlineTokens[lineIndex] || [])
            ]
          });
        }
      }
    }
  }

  return blockTokens;
};

export default { name: "list", parse };
