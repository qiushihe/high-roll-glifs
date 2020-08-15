import { GfmOracle } from "/src/gfm.rule/oracle.type";
import { Blank } from "/src/gfm.rule/block/type";
import rule from "/src/gfm.rule/block/blank.rule";

import { StreamTokenizer } from "../gfm.tokens.type";

const tokenizer: StreamTokenizer = (position: number, oracle: GfmOracle) => {
  const line = oracle.getCurrentLine();
  const result = rule.parse(line, oracle);

  if (result) {
    const { text } = result as Blank;
    return { term: "BlankText", end: position + text.length };
  } else {
    return null;
  }
};

export default tokenizer;
