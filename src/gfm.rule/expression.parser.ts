import size from "lodash/fp/size";
import constant from "lodash/fp/constant";
import cond from "lodash/fp/cond";
import eq from "lodash/fp/eq";
import stubTrue from "lodash/fp/stubTrue";
import isEmpty from "lodash/fp/isEmpty";
import times from "lodash/fp/times";

import { stringStream } from "/src/util/stream.util";
import { MapUnMatch, MapMatch } from "/src/util/stream.util.type";
import { getBlockExpressions, getInlineExpressions } from "./expression";
import {
  blockExpressionsParser,
  inlineExpressionsParser
} from "./expression/type";

export const parseBlockExpressions: blockExpressionsParser = (
  line: string
): { name: string; result: RegExpMatchArray }[] => {
  const expressions = getBlockExpressions();

  const results: { name: string; result: RegExpMatchArray }[] = [];
  let expressionIndex = 0;

  while (true) {
    if (expressionIndex >= expressions.length) {
      break;
    }

    const expression = expressions[expressionIndex];
    const expressionResult = line.match(expression.regexp);

    if (expressionResult) {
      results.push({ name: expression.name, result: expressionResult });
    }

    expressionIndex += 1;
  }

  return results;
};

const handleUnmatched: MapUnMatch = constant(null);

const handleMatchedCodeSpan: MapMatch = (
  character: string,
  index: number,
  matchResult: RegExpMatchArray | null
) => {
  if (matchResult) {
    const openLength = size(matchResult[1]);
    const textLength = size(matchResult[3]);
    const closeLength = size(matchResult[4]);

    if (index < openLength) {
      return ["code-span", "code-span-tick"];
    } else if (
      index >= openLength + textLength &&
      index < openLength + textLength + closeLength
    ) {
      return ["code-span", "code-span-tick"];
    } else {
      return ["code-span"];
    }
  } else {
    return null;
  }
};

const handleMatchedAutoLink: MapMatch = cond([
  [eq("<"), constant(["link-span", "link-span-open"])],
  [eq(">"), constant(["link-span", "link-span-close"])],
  [stubTrue, constant(["link-span"])]
]);

const matchedHandler: { [key: string]: MapMatch } = {
  "code-span": handleMatchedCodeSpan,
  "auto-link": handleMatchedAutoLink
};

export const parseInlineExpressions: inlineExpressionsParser = (
  text: string
): (string[] | null)[] => {
  const expressions = getInlineExpressions();

  let result: (string[] | null)[] = [];
  const layers: (string[] | null)[][] = [];

  let expressionIndex = 0;

  while (true) {
    if (expressionIndex >= expressions.length) {
      break;
    }

    const expression = expressions[expressionIndex];
    const tokens = stringStream(text).mapAllRegExp(
      expression.regexp,
      handleUnmatched,
      matchedHandler[expression.name]
    );

    layers.push(tokens);

    expressionIndex += 1;
  }

  let layerIndex = 0;

  while (true) {
    if (layerIndex >= layers.length) {
      break;
    }

    const layer = layers[layerIndex];

    if (isEmpty(result)) {
      result = layer;
    } else {
      // TODO: Resolve layer-conflicts (i.e. certain inline tokens can not be mixed/crossed with
      //       other inline tokens).
      times(tokenIndex => {
        const combinedTokens = [
          ...(result[tokenIndex] || []),
          ...(layer[tokenIndex] || [])
        ];

        result[tokenIndex] = combinedTokens.length <= 0 ? null : combinedTokens;
      })(result.length);
    }

    layerIndex += 1;
  }

  return result;
};
