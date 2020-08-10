import { ExternalTokenizer, InputStream, Token, Stack } from "lezer";

import settextHeadingTokenizer from "./tokenizers/settext-heading.tokenizer";
import atxHeadingTokenizer from "./tokenizers/atx-heading.tokenizer";
import thematicBreakTokenizer from "./tokenizers/thematic-break.tokenizer";
import paragraphTokenizer from "./tokenizers/paragraph.tokenizer";
import blankTokenizer from "./tokenizers/blank.tokenizer";

export interface TokenizedTerm {
  term: string;
  end: number;
}

export type TokenizerFn = (
  input: InputStream,
  token: Token,
  stack?: Stack
) => TokenizedTerm | null;

const TOKENIZERS: { [key: string]: TokenizerFn } = {
  settextHeadingTokenizer,
  atxHeadingTokenizer,
  thematicBreakTokenizer,
  paragraphTokenizer,
  blankTokenizer
};

export const getExternalTokenizer = (
  name: string,
  terms: { [key: string]: number }
): ExternalTokenizer => {
  const tokenizer = TOKENIZERS[name];

  return new ExternalTokenizer(
    (input, token, stack) => {
      if (tokenizer) {
        const { term: termName, end: termEnd } =
          tokenizer(input, token, stack) || {};

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
    { contextual: true, fallback: true }
  );
};
