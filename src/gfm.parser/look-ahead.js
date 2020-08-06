import last from "lodash/fp/last";
import isNil from "lodash/fp/isNil";

import { parseBlock } from "./block.parser";
import { adaptString } from "./line.adapter";

export const collectLinesAhead = (line, stream, lineType) => {
  const {
    context: { raw }
  } = line;

  let lines = [raw];
  let lookAhead = 1;

  while (true) {
    const lookAheadText = stream.lookAhead(lookAhead);

    if (isNil(lookAheadText)) {
      break;
    }

    const { lineType: lookAheadLineType } = parseBlock(
      adaptString(lookAheadText),
      {
        previousLines: [
          { ...line, context: { ...line.context, raw: last(lines) } }
        ]
      }
    );

    if (lookAheadLineType === lineType) {
      lines = [...lines, lookAheadText];
    } else {
      break;
    }

    lookAhead += 1;
  }

  return lines;
};
