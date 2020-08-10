import { InputStream, Token } from "lezer";

import rule from "/src/gfm.rule/block/settext-heading.rule";

import {
  streamLineOracle,
  readCurrentLine,
  getIndexOnCurrentLine
} from "../gfm.oracle";

import { TokenizerFn } from "../gfm.tokens";

const LINE_TERM = {
  prefix: "SettextPrefix",
  text: "SettextText",
  suffix: "SettextSuffix"
};

const UNDERLINE_TERM = {
  prefix: "SettextUnderlinePrefix",
  text: "SettextUnderlineText",
  suffix: "SettextUnderlineSuffix"
};

const tokenizer: TokenizerFn = (input: InputStream, token: Token) => {
  const line = readCurrentLine(input, token.start);
  const oracle = streamLineOracle(input, token);
  const result = rule.parse(line, oracle);

  if (result) {
    const { isUnderline, prefix, text, suffix } = result;
    const index = getIndexOnCurrentLine(input, token.start);
    const terms = isUnderline ? UNDERLINE_TERM : LINE_TERM;

    if (index < prefix.length) {
      return { term: terms.prefix, end: token.start + prefix.length };
    } else if (index < prefix.length + text.length) {
      return { term: terms.text, end: token.start + text.length };
    } else if (index < prefix.length + text.length + suffix.length) {
      return { term: terms.suffix, end: token.start + suffix.length };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default tokenizer;
