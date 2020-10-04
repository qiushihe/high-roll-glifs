import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import first from "lodash/fp/first";
import get from "lodash/fp/get";
import getOr from "lodash/fp/getOr";
import cond from "lodash/fp/cond";
import times from "lodash/fp/times";
import isArray from "lodash/fp/isArray";
import stubTrue from "lodash/fp/stubTrue";
import add from "lodash/fp/add";
import lte from "lodash/fp/lte";
import identity from "lodash/fp/identity";
import map from "lodash/fp/map";
import filter from "lodash/fp/filter";
import negate from "lodash/fp/negate";
import isNil from "lodash/fp/isNil";
import sortBy from "lodash/fp/sortBy";

export type Tokenizer = (
  string: string,
  position: number
) => [number, string[]] | null;

export type MapToken = (tokenizer: Tokenizer) => string[][];

export type MapMatch = (
  character: string,
  matchPosition: number,
  match: RegExpMatchArray | null,
  position: number,
  string: string
) => string[];

export type MapUnMatch = (
  character: string,
  position: number,
  string: string
) => string[];

export type MapRegExp = (
  regExps: RegExp[] | RegExp,
  unMatchedIterator: MapUnMatch,
  matchedIterator: MapMatch
) => string[][];

export type MapAllRegExp = (
  regExp: RegExp[] | RegExp,
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
    regExps: RegExp[] | RegExp,
    unMatchedIterator: MapUnMatch,
    matchedIterator: MapMatch
  ): string[][] => {
    const result = [];

    // Get remaining substring from the stream.
    const subString = string.slice(stringPosition, Infinity);

    // Get a match by ...
    const matchResult: RegExpExecArray | null = flow([
      // ... ensuring the expression(s) is/are in an array ...
      cond([
        [isArray, identity],
        [stubTrue, (regExp) => [regExp]]
      ]),
      // ... then for each expression ...
      map((regExp: RegExp) => regExp.exec(subString)),
      // ... exclude non-match expressions ...
      filter(negate(isNil)),
      // ... then order all results by the starting index of the match ...
      sortBy(get("index")),
      // ... finally get the closest match.
      first
    ])(regExps);

    // Get absolute match start index by adding the current position
    // of the stream to the match's index.
    const matchStartIndex = flow([
      getOr(-1, "index"),
      cond([
        [lte(0), add(stringPosition)],
        [stubTrue, identity]
      ])
    ])(matchResult);

    // Get matched string length.
    const matchStringLength = flow([first, size])(matchResult);

    // Loop over the matched position range ...
    while (true) {
      if (stringPosition >= stringLength) {
        break;
      }

      const character = string[stringPosition];

      // ... and invoke either ...
      if (matchStartIndex < 0 || stringPosition < matchStartIndex) {
        // ... the un-matched iterator, or ...
        result.push(unMatchedIterator(character, stringPosition, string));
        stringPosition += 1;
      } else {
        const matchedStringPosition = stringPosition - matchStartIndex;
        if (matchedStringPosition < matchStringLength) {
          // ... the matched iterator.
          result.push(
            matchedIterator(
              character,
              matchedStringPosition,
              matchResult,
              stringPosition,
              string
            )
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
    regExps: RegExp[] | RegExp,
    unMatchedIterator: MapUnMatch,
    matchedIterator: MapMatch
  ): string[][] => {
    let result: string[][] = [];

    while (hasMore()) {
      result = [
        ...result,
        ...mapRegExp(regExps, unMatchedIterator, matchedIterator)
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
