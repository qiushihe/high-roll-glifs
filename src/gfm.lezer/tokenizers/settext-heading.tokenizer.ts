import { GfmOracle } from "/src/gfm.rule/oracle.type";
import { SettextHeading } from "/src/gfm.rule/block/type";
import rule from "/src/gfm.rule/block/settext-heading.rule";

import { StreamTokenizer } from "../gfm.tokens.type";

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

const tokenizer: StreamTokenizer = (position: number, oracle: GfmOracle) => {
  const line = oracle.getCurrentLine();
  const result = rule.parse(line, oracle);

  if (result) {
    const { isUnderline, prefix, text, suffix } = result as SettextHeading;

    const index = oracle.getIndexOnCurrentLine();
    const terms = isUnderline ? UNDERLINE_TERM : LINE_TERM;

    if (index < prefix.length) {
      return {
        term: terms.prefix,
        end: position + prefix.length
      };
    } else if (index < prefix.length + text.length) {
      return {
        term: terms.text,
        end: position + text.length
      };
    } else if (index < prefix.length + text.length + suffix.length) {
      return {
        term: terms.suffix,
        end: position + suffix.length
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default tokenizer;
