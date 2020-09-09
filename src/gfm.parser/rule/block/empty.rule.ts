import { EMPTY_BLOCK } from "./type";
import { EMPTY_LINE } from "../line/type";
import { AdaptedStream } from "../../stream/adapter";

import {
  ParseBlockRule,
  ParsedBlock,
  BlockContextBuilder,
  parseLine
} from "../../parser";

const parse: ParseBlockRule = (stream: AdaptedStream): ParsedBlock[] => {
  const blockTokens: ParsedBlock[] = [];
  const emptyLine = parseLine(stream.text()).getLineByType(EMPTY_LINE);

  if (emptyLine) {
    blockTokens.push({
      type: EMPTY_BLOCK,
      context: BlockContextBuilder.new(emptyLine.context.raw).empty().build(),
      inlineTokens: []
    });
  }

  return blockTokens;
};

export default { name: "empty", parse };
