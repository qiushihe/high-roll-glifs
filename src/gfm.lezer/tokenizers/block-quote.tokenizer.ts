import { GfmOracle } from "/src/gfm.rule/oracle.type";
import { BlockQuote } from "/src/gfm.rule/block/type";
import rule from "/src/gfm.rule/block/block-quote.rule";

import { StreamTokenizer } from "../gfm.tokens.type";

const tokenizer: StreamTokenizer = (position: number, oracle: GfmOracle) => {
  const line = oracle.getCurrentLine();
  const result = rule.parse(line, oracle);

  if (result) {
    const { prefix, text } = result as BlockQuote;
    const index = oracle.getIndexOnCurrentLine();

    if (index < prefix.length) {
      return {
        term: "BlockQuotePrefix",
        end: position + prefix.length
      };
    } else if (index < prefix.length + text.length) {
      return {
        term: "BlockQuoteText",
        end: position + text.length
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default tokenizer;
