import { match } from "/src/util/expression.util";

import { GfmOracle } from "../oracle.type";
import { parseInlineExpressions } from "../expression.parser";
import { PARAGRAPH_LINE_REGEXP } from "../expression/block.expression";

import { blockRuleParser, Paragraph } from "./type";

const matchLine = match(PARAGRAPH_LINE_REGEXP);

const getContinuousLines = (delta: number, oracle: GfmOracle): string[] => {
  const lines: string[] = [];

  let lineOffset = delta;

  while (true) {
    const offsetLine = oracle.getLineAtOffset(lineOffset);

    if (offsetLine) {
      const lineMatch = matchLine(offsetLine);
      if (lineMatch) {
        lines.push(offsetLine);
        lineOffset += delta;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return lines;
};

const parse: blockRuleParser = (
  line: string,
  oracle: GfmOracle
): Paragraph | null => {
  const lineMatch = matchLine(line);

  if (lineMatch) {
    const linesBefore = getContinuousLines(-1, oracle).reverse();
    const linesAfter = getContinuousLines(1, oracle);
    const blockLines = [...linesBefore, line, ...linesAfter];
    const blockInlineTokens = parseInlineExpressions(blockLines.join(" "));
    const lengthBefore =
      linesBefore.join(" ").length <= 0 ? 0 : linesBefore.join(" ").length + 1;
    const inlineStyles = blockInlineTokens.slice(
      lengthBefore,
      lengthBefore + line.length
    );

    return {
      type: "paragraph",
      text: lineMatch[0] || "",
      inlineStyles
    };
  } else {
    return null;
  }
};

export default { name: "paragraph", parse };
