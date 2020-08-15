import flow from "lodash/fp/flow";
import map from "lodash/fp/map";
import get from "lodash/fp/get";
import xor from "lodash/fp/xor";
import isEmpty from "lodash/fp/isEmpty";

import { match } from "/src/util/expression.util";

import { BLOCK_QUOTE_LINE_REGEXP } from "../expression/block.expression";

import { GfmOracle } from "../oracle.type";
import { parseBlockExpressions } from "../expression.parser";

import { blockRuleParser, BlockQuote } from "./type";

const matchLine = match(BLOCK_QUOTE_LINE_REGEXP);

const isLazyLineTypes = flow([
  xor(["settext-heading-line", "paragraph"]),
  isEmpty
]);

const isQuoteLineTypes = flow([
  xor(["settext-heading-line", "paragraph", "block-quote"]),
  isEmpty
]);

const getContinuousLines = (oracle: GfmOracle): string[] => {
  const lines: string[] = [];

  let foundQuote = false;
  let lineOffset = 0;

  while (true) {
    const offsetLine = oracle.getLineAtOffset(lineOffset);

    if (offsetLine) {
      const blockTypes = flow([parseBlockExpressions, map(get("name"))])(
        offsetLine
      );
      const isLazyLine = isLazyLineTypes(blockTypes);
      const isQuoteLine = isQuoteLineTypes(blockTypes);

      if (isQuoteLine) {
        lines.push(offsetLine);
        foundQuote = true;
        break;
      } else if (isLazyLine) {
        lines.push(offsetLine);
        lineOffset += -1;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return foundQuote ? lines.reverse() : [];
};

const parse: blockRuleParser = (
  line: string,
  oracle: GfmOracle
): BlockQuote | null => {
  const lineMatch = matchLine(line);

  if (lineMatch) {
    return {
      type: "block-quote",
      prefix: lineMatch[1] || "",
      text: lineMatch[2] || ""
    };
  } else {
    const continuousLines = getContinuousLines(oracle);

    if (continuousLines.length > 0) {
      return {
        type: "block-quote",
        prefix: "",
        text: line
      };
    } else {
      return null;
    }
  }
};

export default { name: "block-quote", parse };
