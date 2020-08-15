import constant from "lodash/fp/constant";

import { AdaptableStream, AdaptedStream } from "../type";

export const adaptStream = (stream: AdaptableStream): AdaptedStream => {
  const match = (pattern: RegExp) => stream.match(pattern, false);

  const lookAhead = (offset: number) => stream.lookAhead(offset);

  return { match, lookAhead };
};

export const adaptString = (string: string): AdaptedStream => {
  const match = (pattern: RegExp) => string.match(pattern);

  const lookAhead = constant(null);

  return { match, lookAhead };
};
