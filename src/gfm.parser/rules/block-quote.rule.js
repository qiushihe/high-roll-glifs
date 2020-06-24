import flow from "lodash/fp/flow";
import last from "lodash/fp/last";
import get from "lodash/fp/get";
import getOr from "lodash/fp/getOr";
import isNil from "lodash/fp/isNil";
import eq from "lodash/fp/eq";

import parseWithRules from "../parse-with-rules";
import { getAllRules } from "./index";

const BLOCK_QUOTE_REGEXP = new RegExp("^(\\s{0,3}>\\s?)(.*)$");

const parse = ({ tokens, lines = [], index = 0 } = {}) => {
  const rules = getAllRules();
  const line = lines[index];

  if (flow([last, get("type"), eq("block-quote")])(tokens)) {
    const parsedTokens = parseWithRules({
      rules,
      tokens: [],
      lines: [line],
      index: 0
    });

    if (!isNil(parsedTokens)) {
      const parsedToken = last(parsedTokens);

      if (parsedToken.type === "paragraph") {
        // Lazy quoted paragraphs counts as block quote as long as the previous token
        // is (or counts as) block quote.
        return [
          ...tokens,
          {
            type: "block-quote",
            token: ["", parsedToken]
          }
        ];
      } else if (parsedToken.type === "block-quote") {
        // Consecutive block quotes are combined.
        return [...tokens, parsedToken];
      } else {
        return null;
      }
    } else {
      return null;
    }
  } else {
    const matchResult = line.match(BLOCK_QUOTE_REGEXP);

    if (matchResult) {
      const prefix = getOr("", 1)(matchResult);
      const quotedText = getOr("", 2)(matchResult);

      const quotedToken = last(
        parseWithRules({
          rules,
          tokens: [],
          lines: [quotedText],
          index: 0
        })
      );

      const { type: quotedTokenType } = quotedToken;

      let token;
      if (quotedTokenType === "block-quote") {
        // If the quoted token is a block quote, then combine their
        // prefix characters instead of nesting the tokens.
        token = {
          ...quotedToken,
          token: flow([
            get("token"),
            ([quotedTokenPrefix, quotedTokenToken]) => [
              `${prefix}${quotedTokenPrefix}`,
              quotedTokenToken
            ]
          ])(quotedToken)
        };
      } else {
        token = {
          type: "block-quote",
          // Store the quoted token with the quote prefix so we can
          // later reconstruct the actual complete line text.
          token: [prefix, quotedToken]
        };
      }

      return [...tokens, token];
    } else {
      return null;
    }
  }
};

export default { name: "block-quote", parse };
