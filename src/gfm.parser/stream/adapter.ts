import constant from "lodash/fp/constant";

export interface AdaptableStream {
  match: (pattern: RegExp, UNUSED_consume: boolean) => RegExpMatchArray | null;
  lookAhead: (offset: number) => string | null;
}

export interface AdaptedStream {
  match: (pattern: RegExp) => RegExpMatchArray | null;
  lookAhead: (offset: number) => string | null;
}

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
