import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import getOr from "lodash/fp/getOr";
import cond from "lodash/fp/cond";
import times from "lodash/fp/times";

export type Tokenizer = (
  string: string,
  position: number
) => [number, string[]] | null;

export type MapToken = (tokenizer: Tokenizer) => string[][];

export type MapMatch = (
  character: string,
  position: number,
  match: RegExpMatchArray | null
) => string[];

export type MapUnMatch = (
  character: string,
  position: number,
  string: string
) => string[];

export type MapRegExp = (
  regexp: RegExp,
  unMatchedIterator: MapUnMatch,
  matchedIterator: MapMatch
) => string[][];

export type MapAllRegExp = (
  regexp: RegExp,
  unMatchedIterator: MapUnMatch,
  matchedIterator: MapMatch
) => string[][];

export interface StringStream {
  mapToken: MapToken;
  mapRegExp: MapRegExp;
  mapAllRegExp: MapAllRegExp;
  remainingLength: () => number;
  hasMore: () => boolean;
}

export const stringStream = (string: string): StringStream => {
  const stringLength = size(string);
  let stringPosition = 0;

  const mapToken: MapToken = (tokenizer: Tokenizer): string[][] => {
    const result: string[][] = [];

    while (true) {
      if (stringPosition >= stringLength) {
        break;
      }

      const tokenizerResult = tokenizer(string, stringPosition);
      if (tokenizerResult) {
        const [consumeLength, tokens] = tokenizerResult;

        // The `tokenizer` function should return non-zero `consumeLength` at least some of the times
        // otherwise the `while` loop will never end.
        times(() => {
          result.push(tokens);
          stringPosition += 1;
        })(consumeLength);
      } else {
        result.push([]);
        stringPosition += 1;
      }
    }

    return result;
  };

  const mapRegExp: MapRegExp = (
    regexp: RegExp,
    unMatchedIterator: MapUnMatch,
    matchedIterator: MapMatch
  ): string[][] => {
    const result = [];

    const subString = string.slice(stringPosition, Infinity);
    const matchResult = regexp.exec(subString);
    const matchedString = getOr("", 0)(matchResult);
    const matchedStringLength = size(matchedString);

    const matchStartIndex = flow([
      getOr(-1, "index"),
      cond([
        [(i) => i >= 0, (i) => i + stringPosition],
        [() => true, (i) => i]
      ])
    ])(matchResult);

    while (true) {
      if (stringPosition >= stringLength) {
        break;
      }

      const character = string[stringPosition];

      if (matchStartIndex < 0 || stringPosition < matchStartIndex) {
        result.push(unMatchedIterator(character, stringPosition, string));
        stringPosition += 1;
      } else {
        const matchedStringPosition = stringPosition - matchStartIndex;
        if (matchedStringPosition < matchedStringLength) {
          result.push(
            matchedIterator(character, matchedStringPosition, matchResult)
          );
          stringPosition += 1;
        } else {
          break;
        }
      }
    }

    return result;
  };

  const mapAllRegExp: MapAllRegExp = (
    regexp: RegExp,
    unMatchedIterator: MapUnMatch,
    matchedIterator: MapMatch
  ): string[][] => {
    let result: string[][] = [];

    while (hasMore()) {
      result = [
        ...result,
        ...mapRegExp(regexp, unMatchedIterator, matchedIterator)
      ];
    }

    return result;
  };

  const remainingLength = (): number => {
    return stringLength - stringPosition;
  };

  const hasMore = (): boolean => {
    return remainingLength() > 0;
  };

  return {
    mapToken,
    mapRegExp,
    mapAllRegExp,
    remainingLength,
    hasMore
  };
};
