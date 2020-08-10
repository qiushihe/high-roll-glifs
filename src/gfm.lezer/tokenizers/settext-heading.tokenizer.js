import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import nth from "lodash/fp/nth";

import {
  readCurrentLine,
  getIndexOnCurrentLine,
  readLinesAhead
} from "../utils";

const SETTEXT_HEADING_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})(([^\\s]\\s*?)+)(\\s*)$",
  "i"
);

const SETTEXT_HEADING_UNDERLINE_REGEXP = new RegExp(
  "^(\\s{0,3})((-+)|(=+))(\\s*)$",
  "i"
);

const tokenizeHeadingLine = (input, token) => {
  const line = readCurrentLine(input, token.start);
  const lineMatch = line.match(SETTEXT_HEADING_LINE_REGEXP);
  const nextLine = readLinesAhead(input, token.start, 1);
  const nextLineMatch = nextLine.match(SETTEXT_HEADING_UNDERLINE_REGEXP);

  if (lineMatch && nextLineMatch) {
    const index = getIndexOnCurrentLine(input, token.start);

    const prefixLength = flow([nth(1), size])(lineMatch);
    const textLength = flow([nth(2), size])(lineMatch);
    const suffixLength = flow([nth(4), size])(lineMatch);

    if (index < prefixLength) {
      return { term: "SettextPrefix", end: token.start + prefixLength };
    } else if (index < prefixLength + textLength) {
      return { term: "SettextText", end: token.start + textLength };
    } else if (index < prefixLength + textLength + suffixLength) {
      return { term: "SettextSuffix", end: token.start + suffixLength };
    }
  }
};

const tokenizeUnderline = (input, token) => {
  const line = readCurrentLine(input, token.start);
  const underlineMatch = line.match(SETTEXT_HEADING_UNDERLINE_REGEXP);

  if (underlineMatch) {
    const previousLineText = readCurrentLine(input, token.start - 1);
    const previousLineMatch = previousLineText.match(
      SETTEXT_HEADING_LINE_REGEXP
    );

    const index = getIndexOnCurrentLine(input, token.start);
    const underlinePrefixLength = flow([nth(1), size])(underlineMatch);
    const underlineTextLength = flow([nth(2), size])(underlineMatch);
    const underlineSuffixLength = flow([nth(5), size])(underlineMatch);

    if (previousLineMatch) {
      if (index < underlinePrefixLength) {
        return {
          term: "SettextUnderlinePrefix",
          end: token.start + underlinePrefixLength
        };
      } else if (index < underlinePrefixLength + underlineTextLength) {
        return {
          term: "SettextUnderlineText",
          end: token.start + underlineTextLength
        };
      } else if (
        index <
        underlinePrefixLength + underlineTextLength + underlineSuffixLength
      ) {
        return {
          term: "SettextUnderlineSuffix",
          end: token.start + underlineSuffixLength
        };
      }
    }
  }
};

const tokenizer = (input, token) => {
  return tokenizeHeadingLine(input, token) || tokenizeUnderline(input, token);
};

export default tokenizer;
