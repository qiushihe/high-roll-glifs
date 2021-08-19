import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import includes from "lodash/fp/includes";
import times from "lodash/fp/times";
import constant from "lodash/fp/constant";
import join from "lodash/fp/join";

import { AdaptedStream } from "../../stream/adapter";

import {
  LIST_ITEM_LINE,
  PARAGRAPH_LINE,
  INDENTED_CODE_LINE,
  EMPTY_LINE,
  BLANK_LINE
} from "../line/type";

import {
  ParseBlockRule,
  ParsedBlock,
  BlockContext,
  BlockContextBuilder,
  parseLine,
  parseInlineLines
} from "../../parser";

import { BULLET_LIST_BLOCK, ORDERED_LIST_BLOCK } from "./type";

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
  const { lineType, lineText, prefix, digits, marker, spaces, content } =
    lineMatch;

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

const isLineCollectable = (
  blockContext: BlockContext,
  stream: AdaptedStream,
  lookAheadOffset: number,
  lookAheadAgain?: boolean
): [boolean, string] => {
  const lookAheadStream = stream.slice(lookAheadOffset);
  const parsedLine = parseLine(lookAheadStream.text());
  const parsedLineTypes = parsedLine.getTypes();

  // If the look ahead line is only match 1 type and that type is paragraph ...
  if (
    parsedLineTypes.length === 1 &&
    includes(PARAGRAPH_LINE)(parsedLineTypes)
  ) {
    const paragraphLine = parsedLine.getLineByType(PARAGRAPH_LINE);
    // ... then collect the line.
    return [true, paragraphLine.context.raw];
  }
  // If the look ahead line is matching indented code line ...
  else if (includes(INDENTED_CODE_LINE)(parsedLineTypes)) {
    const indentedCodeLine = parsedLine.getLineByType(INDENTED_CODE_LINE);
    const { raw, list } = blockContext;

    if (indentedCodeLine && list) {
      const { leader } = list;

      // ... calculate effective indentation of list content ...
      const dots = flow([times(constant(".")), join("")])(leader);
      const spaces = flow([times(constant(" ")), join("")])(leader);
      const listIndentsMatch = raw
        .replace(new RegExp(`^${dots}`, "g"), spaces)
        .match(/^\s*/);
      const lineIndentsMatch = lookAheadStream.text().match(/^\s*/);

      if (listIndentsMatch && lineIndentsMatch) {
        const listIndents = listIndentsMatch[0].length;
        const lineIndents = lineIndentsMatch[0].length;

        // ... if the look ahead line's content indentation matches the list's effective
        // indentation ...
        if (lineIndents === listIndents) {
          // ... then collect the line.
          return [true, indentedCodeLine.context.raw];
        } else {
          return [false, null];
        }
      } else {
        return [false, null];
      }
    } else {
      return [false, null];
    }
  }
  // If the look head line if an empty/blank line ...
  else if (
    !lookAheadAgain && // Break recursion after 1 level so only further look ahead at most 1 line.
    (includes(EMPTY_LINE)(parsedLineTypes) ||
      includes(BLANK_LINE)(parsedLineTypes))
  ) {
    // Technically we should look ahead indefinitely to find collectable lines but in practice that
    // is both too expensive of an operation, and rarely needed as most people wouldn't try to
    // insert more than 1 blank/empty line between list content lines anyway. And even if someone
    // does insert more than 1 blank/empty line between list content, it should be pretty obvious
    // to them why it wouldn't work anyway, so for now it's okay to only look ahead 1 line.

    // ... further look ahead ...
    const lookAheadAgainStream = stream.slice(lookAheadOffset + 1);

    if (lookAheadAgainStream.ended()) {
      return [false, null];
    } else {
      // ... and if the yet next line is collectable ...
      const [isNextLineCollectable] = isLineCollectable(
        blockContext,
        stream,
        lookAheadOffset + 1,
        true
      );

      if (isNextLineCollectable) {
        // ... then collect the current line.
        return [true, lookAheadStream.text()];
      } else {
        return [false, null];
      }
    }
  } else {
    return [false, null];
  }
};

const collectLines = (
  lineType: string,
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

    const [isCollectable, line] = isLineCollectable(
      blockContext,
      stream,
      lookAheadOffset
    );

    if (isCollectable) {
      lines.push(line);
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
