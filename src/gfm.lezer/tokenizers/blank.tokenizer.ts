import { InputStream, Token } from "lezer";

import rule from "/src/gfm.rule/block/blank.rule";

import { streamLineOracle, readCurrentLine } from "../gfm.oracle";
import { TokenizerFn } from "../gfm.tokens";

const tokenizer: TokenizerFn = (input: InputStream, token: Token) => {
  const line = readCurrentLine(input, token.start);
  const oracle = streamLineOracle(input, token);
  const result = rule.parse(line, oracle);

  if (result) {
    const { text } = result;
    return { term: "blank", end: token.start + text.length };
  } else {
    return null;
  }
};

export default tokenizer;
