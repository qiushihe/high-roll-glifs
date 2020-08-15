import { GfmOracle } from "/src/gfm.rule/oracle.type";
import { AtxHeading } from "/src/gfm.rule/block/type";
import rule from "/src/gfm.rule/block/atx-heading.rule";

import { StreamTokenizer } from "../gfm.tokens.type";

const tokenizer: StreamTokenizer = (position: number, oracle: GfmOracle) => {
  const line = oracle.getCurrentLine();
  const result = rule.parse(line, oracle);

  if (result) {
    const { prefix, level, space, text, suffix } = result as AtxHeading;
    const index = oracle.getIndexOnCurrentLine();

    if (index < prefix.length) {
      return { term: "AtxPrefix", end: position + prefix.length };
    } else if (index < prefix.length + level.length) {
      return { term: "AtxLevel", end: position + level.length };
    } else if (index < prefix.length + level.length + space.length) {
      return { term: "AtxSpace", end: position + space.length };
    } else if (
      index <
      prefix.length + level.length + space.length + text.length
    ) {
      return { term: "AtxText", end: position + text.length };
    } else if (
      index <
      prefix.length + level.length + space.length + text.length + suffix.length
    ) {
      return { term: "AtxSuffix", end: position + suffix.length };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default tokenizer;
