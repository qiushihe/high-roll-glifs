import { GfmOracle } from "/src/gfm.rule/oracle.type";
import { ThematicBreak } from "/src/gfm.rule/block/type";
import rule from "/src/gfm.rule/block/thematic-break.rule";

import { StreamTokenizer } from "../gfm.tokens.type";

const tokenizer: StreamTokenizer = (position: number, oracle: GfmOracle) => {
  const line = oracle.getCurrentLine();
  const result = rule.parse(line, oracle);

  if (result) {
    const { prefix, text, suffix } = result as ThematicBreak;
    const index = oracle.getIndexOnCurrentLine();

    if (index < prefix.length) {
      return { term: "ThematicBreakPrefix", end: position + prefix.length };
    } else if (index < prefix.length + text.length) {
      return { term: "ThematicBreakText", end: position + text.length };
    } else if (index < prefix.length + text.length + suffix.length) {
      return { term: "ThematicBreakSuffix", end: position + suffix.length };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default tokenizer;
