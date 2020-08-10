import { InputStream, Token } from "lezer";

import rule from "/src/gfm.rule/block/atx-heading.rule";

import {
  streamLineOracle,
  readCurrentLine,
  getIndexOnCurrentLine
} from "../gfm.oracle";

import { TokenizerFn } from "../gfm.tokens";

const tokenizer: TokenizerFn = (input: InputStream, token: Token) => {
  const line = readCurrentLine(input, token.start);
  const oracle = streamLineOracle(input, token);
  const result = rule.parse(line, oracle);

  if (result) {
    const { prefix, level, space, text, suffix } = result;
    const index = getIndexOnCurrentLine(input, token.start);

    if (index < prefix.length) {
      return { term: "AtxPrefix", end: token.start + prefix.length };
    } else if (index < prefix.length + level.length) {
      return { term: "AtxLevel", end: token.start + level.length };
    } else if (index < prefix.length + level.length + space.length) {
      return { term: "AtxSpace", end: token.start + space.length };
    } else if (
      index <
      prefix.length + level.length + space.length + text.length
    ) {
      return { term: "AtxText", end: token.start + text.length };
    } else if (
      index <
      prefix.length + level.length + space.length + text.length + suffix.length
    ) {
      return { term: "AtxSuffix", end: token.start + suffix.length };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default tokenizer;
