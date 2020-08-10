import get from "lodash/fp/get";
import size from "lodash/fp/size";
import getOr from "lodash/fp/getOr";

import { readCurrentLine, getIndexOnCurrentLine } from "../utils";

const ATX_HEADING_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})(#{1,6})(\\s(.*?))?(\\s+#+\\s*)?$",
  "i"
);

const tokenizer = (input, token) => {
  const line = readCurrentLine(input, token.start);
  const lineMatch = line.match(ATX_HEADING_LINE_REGEXP);

  const prefix = getOr("", 1)(lineMatch);
  const level = get(2)(lineMatch);
  const space = getOr("", 3)(lineMatch);
  const text = getOr("", 4)(lineMatch);
  const suffix = getOr("", 5)(lineMatch);

  const prefixLength = size(prefix);
  const levelLength = size(level);
  const spaceLength = size(space) >= 1 ? 1 : 0;
  const textLength = size(text);
  const suffixLength = size(suffix);

  if (lineMatch) {
    const index = getIndexOnCurrentLine(input, token.start);

    if (index < prefixLength) {
      return { term: "AtxPrefix", end: token.start + prefixLength };
    } else if (index < prefixLength + levelLength) {
      return { term: "AtxLevel", end: token.start + levelLength };
    } else if (index < prefixLength + levelLength + spaceLength) {
      return { term: "AtxSpace", end: token.start + spaceLength };
    } else if (index < prefixLength + levelLength + spaceLength + textLength) {
      return { term: "AtxText", end: token.start + textLength };
    } else if (
      index <
      prefixLength + levelLength + spaceLength + textLength + suffixLength
    ) {
      return { term: "AtxSuffix", end: token.start + suffixLength };
    }
  }
};

export default tokenizer;
