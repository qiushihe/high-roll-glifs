import { ExternalTokenizer } from "lezer";

import { StreamTokenizer } from "./gfm.tokens.type";
import gfmOracle from "./gfm.oracle";

import settextHeadingTokenizer from "./tokenizers/settext-heading.tokenizer";
import atxHeadingTokenizer from "./tokenizers/atx-heading.tokenizer";
import thematicBreakTokenizer from "./tokenizers/thematic-break.tokenizer";
import blockQuoteTokenizer from "./tokenizers/block-quote.tokenizer";
import paragraphTokenizer from "./tokenizers/paragraph.tokenizer";
import blankTokenizer from "./tokenizers/blank.tokenizer";

const TOKENIZERS: { [key: string]: StreamTokenizer } = {
  settextHeadingTokenizer,
  atxHeadingTokenizer,
  thematicBreakTokenizer,
  blockQuoteTokenizer,
  paragraphTokenizer,
  blankTokenizer
};

const NULL_TOKENIZER = new ExternalTokenizer(() => {});

export const getExternalTokenizer = (
  name: string,
  terms: { [key: string]: number }
): ExternalTokenizer => {
  const tokenizer = TOKENIZERS[name];

  if (tokenizer) {
    return new ExternalTokenizer(
      (input, token) => {
        const position = token.start;
        const oracle = gfmOracle(input, position);
        const tokenizerResult = tokenizer(position, oracle);

        if (tokenizerResult) {
          const { term: termName, end: termEnd } = tokenizerResult;

          if (termName) {
            const term = terms[termName];

            // Because `termEnd` could be `0` which is acceptable,
            // we compare `termEnd` against null/undefined explicitly.
            if (term && termEnd !== null && termEnd !== undefined) {
              token.accept(term, termEnd);
            }
          }
        }
      },
      { contextual: true }
    );
  } else {
    return NULL_TOKENIZER;
  }
};
