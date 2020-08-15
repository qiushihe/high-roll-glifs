export type Tokenizer = (string: string, position: number) => string | null;

export type TokenMapper = (
  token: string,
  position: number,
  string: string
) => string | null;

export type MapToken = (
  tokenizer: Tokenizer,
  iterator: TokenMapper
) => (string | null)[];

export type MapMatch = (
  character: string,
  position: number,
  match: RegExpMatchArray | null
) => string[] | null;

export type MapUnMatch = (
  character: string,
  position: number,
  string: string
) => string[] | null;

export type MapRegExp = (
  regexp: RegExp,
  unMatchedIterator: MapUnMatch,
  matchedIterator: MapMatch
) => (string[] | null)[];

export type MapAllRegExp = (
  regexp: RegExp,
  unMatchedIterator: MapUnMatch,
  matchedIterator: MapMatch
) => (string[] | null)[];

export interface StringStream {
  mapToken: MapToken;
  mapRegExp: MapRegExp;
  mapAllRegExp: MapAllRegExp;
  remainingLength: () => number;
  hasMore: () => boolean;
}
