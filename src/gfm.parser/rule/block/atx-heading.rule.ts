import { ATX_HEADING_BLOCK } from "./type";
import { ATX_HEADING_LINE } from "../line/type";
import { AdaptedStream } from "../../stream/adapter";
import { getConflictMap } from "../inline/rule";

import {
  ParseBlockRule,
  ParsedBlock,
  BlockContextBuilder,
  parseLine,
  parseInline,
  recombobulator
} from "../../parser";

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const atxHeadingLine = parseLine(stream.text()).getLineByType(
    ATX_HEADING_LINE
  );

  if (atxHeadingLine && atxHeadingLine.context.atxHeading) {
    const rawText = atxHeadingLine.context.raw;
    const atxHeading = atxHeadingLine.context.atxHeading;

    let inlineTokens: string[][] = [];

    const levelToken = `atx-heading-level-${atxHeading.level}`;

    inlineTokens = recombobulator(
      rawText.length,
      getConflictMap()
    )([
      [
        ...Array(atxHeading.prefix.length).fill([levelToken, "block-syntax"]),
        ...Array(atxHeading.level).fill([levelToken, "block-syntax"]),
        ...Array(atxHeading.space.length).fill([levelToken, "block-syntax"]),
        ...Array(atxHeading.text.length).fill([levelToken]),
        ...Array(atxHeading.suffix.length).fill([levelToken, "block-syntax"])
      ],
      ...parseInline(atxHeading.text).map((layer) => [
        ...Array(atxHeading.prefix.length).fill([]),
        ...Array(atxHeading.level).fill([]),
        ...Array(atxHeading.space.length).fill([]),
        ...layer,
        ...Array(atxHeading.suffix.length).fill([])
      ])
    ]);

    blockTokens.push({
      type: ATX_HEADING_BLOCK,
      context: BlockContextBuilder.new(rawText)
        .atxHeading(
          atxHeading.level,
          atxHeading.prefix,
          atxHeading.text,
          atxHeading.suffix
        )
        .build(),
      inlineTokens
    });
  }

  return blockTokens;
};

export default { name: "atx-heading", parse };
