import size from "lodash/fp/size";

import { BULLET_LIST_BLOCK, ORDERED_LIST_BLOCK } from "./type";
import { LIST_ITEM_LINE, PARAGRAPH_LINE } from "../line/type";
import { AdaptedStream } from "../../stream/adapter";

import {
  ParseBlockRule,
  ParsedBlock,
  BlockContext,
  BlockContextBuilder,
  parseLine,
  parseInlineLines
} from "../../parser";

type ListItemAttributes = {
  lineType: string;
  lineText: string;
  prefix: string;
  digits: string;
  marker: string;
  spaces: string;
  content: string;
};

const getListItemAttributes = (
  stream: AdaptedStream
): ListItemAttributes | null => {
  const listItemLine = parseLine(stream.text()).getLineByType(LIST_ITEM_LINE);

  if (listItemLine && listItemLine.context.listItem) {
    const rawText = listItemLine.context.raw;
    const listItem = listItemLine.context.listItem;

    const common = {
      lineText: rawText,
      prefix: listItem.prefix,
      digits: listItem.digits,
      marker: listItem.marker,
      spaces: listItem.spaces,
      content: listItem.content
    };

    if (listItem.type === "bullet") {
      return { lineType: BULLET_LIST_BLOCK, ...common };
    } else if (listItem.type === "ordered") {
      return { lineType: ORDERED_LIST_BLOCK, ...common };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const getBlockContext = (
  lineMatch: ListItemAttributes
): BlockContext | null => {
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
      return BlockContextBuilder.new(lineText)
        .list(
          lineType === BULLET_LIST_BLOCK ? "bullet" : "ordered",
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
      BlockContextBuilder.new(lineText)
        // The `+ 1` is because even though the list item itself has no content, any lazy
        // continuation lines would still need the extra space added before their content.
        .list(
          lineType === BULLET_LIST_BLOCK ? "bullet" : "ordered",
          size(leader) + 1
        )
        .build()
    );
  }
};

const collectLines = (
  lineType: string,
  lineContext: BlockContext,
  stream: AdaptedStream
): string[] => {
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

// TODO: Parse "content" segment as blocks, and if the parsed content turns out to be anything
//       other than "indented code block", then "content" can "give up" certain number of leading
//       spaces so that the "space" segment would have up to 4 spaces.
//       This step needs to be done before the "leader" segment can be determined.

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const listItemAttributes = getListItemAttributes(stream);

  if (listItemAttributes) {
    const blockContext = getBlockContext(listItemAttributes);

    if (blockContext) {
      const contextList = blockContext.list;

      if (contextList) {
        const { lineType, lineText, content } = listItemAttributes;

        const restLines = collectLines(lineType, blockContext, stream);

        const inlineLines = [content, ...restLines];

        const inlineTokens: string[][][] = parseInlineLines(inlineLines);

        const rawLines: [number, string][] = [
          [contextList.leader, lineText],
          ...(restLines.map((text) => [0, text]) as [number, string][])
        ];

        for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
          const lineLeader = rawLines[lineIndex][0];
          const lineText = rawLines[lineIndex][1];

          blockTokens.push({
            type: lineType,
            context: BlockContextBuilder.new(lineText)
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
