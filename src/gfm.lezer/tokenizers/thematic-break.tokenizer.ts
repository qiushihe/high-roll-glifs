import { InputStream, Token } from "lezer";

import rule from "/src/gfm.rule/block/thematic-break.rule";

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
    const { prefix, text, suffix } = result;
    const index = getIndexOnCurrentLine(input, token.start);

    if (index < prefix.length) {
      return { term: "ThematicBreakPrefix", end: token.start + prefix.length };
    } else if (index < prefix.length + text.length) {
      return { term: "ThematicBreakText", end: token.start + text.length };
    } else if (index < prefix.length + text.length + suffix.length) {
      return { term: "ThematicBreakSuffix", end: token.start + suffix.length };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default tokenizer;
