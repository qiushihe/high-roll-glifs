import { ExternalTokenizer } from "lezer";

import settextHeadingTokenizer from "./tokenizers/settext-heading.tokenizer";
import atxHeadingTokenizer from "./tokenizers/atx-heading.tokenizer";
import thematicBreakTokenizer from "./tokenizers/thematic-break.tokenizer";
import paragraphTokenizer from "./tokenizers/paragraph.tokenizer";
import blankTokenizer from "./tokenizers/blank.tokenizer";

const TOKENIZERS = {
  settextHeadingTokenizer,
  atxHeadingTokenizer,
  thematicBreakTokenizer,
  paragraphTokenizer,
  blankTokenizer
};

export const getEternalTokenizer = (name, terms) => {
  const tokenizer = TOKENIZERS[name];

  return new ExternalTokenizer(
    (input, token, stack) => {
      if (tokenizer) {
        const { term: termName, end: termEnd } =
          tokenizer(input, token, stack) || {};
        const term = terms[termName];

        if (term) {
          token.accept(term, termEnd);
        }
      }
    },
    { contextual: true, fallback: true }
  );
};
