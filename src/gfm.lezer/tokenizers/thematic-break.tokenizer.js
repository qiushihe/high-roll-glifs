import flow from "lodash/fp/flow";
import nth from "lodash/fp/nth";
import size from "lodash/fp/size";

import { readCurrentLine, getIndexOnCurrentLine } from "../utils";

const THEMATIC_BREAK_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})((-\\s*?){3,}|(_\\s*?){3,}|(\\*\\s*?){3,})(\\s*)$",
  "i"
);

const tokenizer = (input, token) => {
  const line = readCurrentLine(input, token.start);
  const lineMatch = line.match(THEMATIC_BREAK_LINE_REGEXP);

  if (lineMatch) {
    const index = getIndexOnCurrentLine(input, token.start);
    const prefixLength = flow([nth(1), size])(lineMatch);
    const textLength = flow([nth(2), size])(lineMatch);
    const suffixLength = flow([nth(6), size])(lineMatch);

    if (index < prefixLength) {
      return { term: "ThematicBreakPrefix", end: token.start + prefixLength };
    } else if (index < prefixLength + textLength) {
      return { term: "ThematicBreakText", end: token.start + textLength };
    } else if (index < prefixLength + textLength + suffixLength) {
      return { term: "ThematicBreakSuffix", end: token.start + suffixLength };
    }
  }
};

export default tokenizer;
