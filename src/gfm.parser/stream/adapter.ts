export interface AdaptableStream {
  text: () => string;
  ended: () => boolean;
  match: (pattern: RegExp, UNUSED_consume: boolean) => RegExpMatchArray | null;
  slice: (from: number) => AdaptableStream;
}

export interface AdaptedStream {
  text: () => string;
  ended: () => boolean;
  match: (pattern: RegExp) => RegExpMatchArray | null;
  slice: (from: number) => AdaptedStream;
}

export const adaptStream = (stream: AdaptableStream): AdaptedStream => {
  const text = () => stream.text();

  const ended = () => stream.ended();

  const match = (pattern: RegExp) => stream.match(pattern, false);

  const slice = (from: number) => adaptStream(stream.slice(from));

  return { text, ended, match, slice };
};
