import flow from "lodash/fp/flow";
import map from "lodash/fp/map";
import get from "lodash/fp/get";
import xor from "lodash/fp/xor";
import first from "lodash/fp/first";
import overSome from "lodash/fp/overSome";
import isEmpty from "lodash/fp/isEmpty";

import { match } from "/src/util/expression.util";

import {
  SETTEXT_HEADING_LINE_REGEXP,
  SETTEXT_HEADING_UNDERLINE_REGEXP
} from "../expression/block.expression";

import { GfmOracle } from "../oracle.type";
import { parseBlockExpressions } from "../expression.parser";

import { blockRuleParser, SettextHeading } from "./type";

const matchLine = match(SETTEXT_HEADING_LINE_REGEXP);

const matchUnderline = match(SETTEXT_HEADING_UNDERLINE_REGEXP);

const isLineTypes = flow([xor(["settext-heading-line", "paragraph"]), isEmpty]);

const isUnderlineTypes = overSome([
  flow([
    xor([
      "settext-heading-line",
      "settext-heading-underline",
      "thematic-break",
      "paragraph"
    ]),
    isEmpty
  ]),
  flow([
    xor(["settext-heading-line", "settext-heading-underline", "paragraph"]),
    isEmpty
  ])
]);

const getContinuousLines = (
  oracle: GfmOracle
): { isUnderline: boolean; text: string }[] => {
  const lines: { isUnderline: boolean; text: string }[] = [];

  let foundUnderline = false;
  let lineOffset = 0;

  while (true) {
    const offsetLine = oracle.getLineAtOffset(lineOffset);

    if (offsetLine) {
      const blockTypes = flow([parseBlockExpressions, map(get("name"))])(
        offsetLine
      );
      const isHeadingLine = isLineTypes(blockTypes);
      const isUnderline = isUnderlineTypes(blockTypes);

      if (isHeadingLine) {
        lines.push({ isUnderline: false, text: offsetLine });
        lineOffset += 1;
      } else if (isUnderline) {
        lines.push({ isUnderline: true, text: offsetLine });
        foundUnderline = true;
        break;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return foundUnderline ? lines : [];
};

const parse: blockRuleParser = (
  line: string,
  oracle: GfmOracle
): SettextHeading | null => {
  const continuousLines = getContinuousLines(oracle);

  if (continuousLines.length > 0) {
    const isUnderline = flow([first, get("isUnderline")])(continuousLines);

    if (isUnderline) {
      const blockTypes = flow([parseBlockExpressions, map(get("name"))])(
        oracle.getLineAtOffset(-1)
      );
      const isHeadingLine = isLineTypes(blockTypes);

      if (isHeadingLine) {
        const underlineMatch = matchUnderline(line);

        if (underlineMatch) {
          return {
            type: "settext-heading",
            isUnderline: true,
            prefix: underlineMatch[1] || "",
            text: underlineMatch[2] || "",
            suffix: underlineMatch[5] || ""
          };
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      const lineMatch = matchLine(line);

      if (lineMatch) {
        return {
          type: "settext-heading",
          isUnderline: false,
          prefix: lineMatch[1] || "",
          text: lineMatch[2] || "",
          suffix: lineMatch[4] || ""
        };
      } else {
        return null;
      }
    }
  } else {
    return null;
  }
};

export default { name: "settext-heading", parse };
