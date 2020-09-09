import { THEMATIC_BREAK_BLOCK } from "./type";
import { THEMATIC_BREAK_LINE } from "../line/type";
import { AdaptedStream } from "../../stream/adapter";

import {
  ParseBlockRule,
  ParsedBlock,
  BlockContextBuilder,
  parseLine
} from "../../parser";

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const thematicBreakLine = parseLine(stream.text()).getLineByType(
    THEMATIC_BREAK_LINE
  );

  if (thematicBreakLine && thematicBreakLine.context.thematicBreak) {
    const rawText = thematicBreakLine.context.raw;
    const thematicBreak = thematicBreakLine.context.thematicBreak;

    blockTokens.push({
      type: THEMATIC_BREAK_BLOCK,
      context: BlockContextBuilder.new(rawText)
        .thematicBreak(
          thematicBreak.prefix,
          thematicBreak.text,
          thematicBreak.suffix
        )
        .build(),
      inlineTokens: []
    });
  }

  return blockTokens;
};

export default { name: "thematic-break", parse };
