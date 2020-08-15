import includes from "lodash/fp/includes";

import { GfmOracle } from "/src/gfm.rule/oracle.type";
import { Paragraph } from "/src/gfm.rule/block/type";
import rule from "/src/gfm.rule/block/paragraph.rule";

import { StreamTokenizer } from "../gfm.tokens.type";

const getInlineStyleTerm = (styles: string[] | null): string => {
  if (includes("code-span")(styles)) {
    return "ParagraphTextCodeSpan";
  } else if (includes("link-span")(styles)) {
    return "ParagraphTextAutoLink";
  } else {
    return "ParagraphTextNormal";
  }
};

const tokenizer: StreamTokenizer = (position: number, oracle: GfmOracle) => {
  const line = oracle.getCurrentLine();
  const result = rule.parse(line, oracle);

  if (result) {
    const { inlineStyles } = result as Paragraph;
    const indexOnLine = oracle.getIndexOnCurrentLine();

    let term = undefined;
    let offset = 0;

    while (true) {
      if (indexOnLine + offset >= inlineStyles.length) {
        break;
      }

      const style = inlineStyles[indexOnLine + offset];
      const styleTerm = getInlineStyleTerm(style);

      if (term === undefined) {
        term = styleTerm;
      } else {
        if (styleTerm !== term) {
          break;
        } else {
          offset += 1;
        }
      }
    }

    return {
      term: term || "ParagraphTextNormal",
      end: position + offset
    };
  } else {
    return null;
  }
};

export default tokenizer;
