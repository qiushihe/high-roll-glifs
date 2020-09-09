import { BLANK_BLOCK } from "./type";
import { BLANK_LINE } from "../line/type";
import { AdaptedStream } from "../../stream/adapter";

import {
  ParseBlockRule,
  ParsedBlock,
  BlockContextBuilder,
  parseLine
} from "../../parser";

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const blankLine = parseLine(stream.text()).getLineByType(BLANK_LINE);

  if (blankLine) {
    blockTokens.push({
      type: BLANK_BLOCK,
      context: BlockContextBuilder.new(blankLine.context.raw).blank().build(),
      inlineTokens: []
    });
  }

  return blockTokens;
};

export default { name: "blank", parse };
