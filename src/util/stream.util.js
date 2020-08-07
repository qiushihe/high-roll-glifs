import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import getOr from "lodash/fp/getOr";
import cond from "lodash/fp/cond";
import isNil from "lodash/fp/isNil";
import isEmpty from "lodash/fp/isEmpty";

export const stringStream = string => {
  const stream = {};

  const stringLength = size(string);
  let stringPosition = 0;

  stream.mapToken = (tokenizer, iterator) => {
    const result = [];

    while (true) {
      if (stringPosition >= stringLength) {
        break;
      }

      const token = tokenizer(string, stringPosition);

      if (isNil(token) || isEmpty(token)) {
        // The `tokenizer` should always return an non-empty token, however if for some reason the
        // function does not return an non-empty token, treat it as if it returned a 1-length token
        // in order to prevent the loop from stalling infinitely.
        stringPosition += 1;
      } else {
        result.push(iterator(token, stringPosition, string));
        stringPosition += size(token);
      }
    }

    return result;
  };

  stream.mapRegExp = (regexp, unMatchedIterator, matchedIterator) => {
    const result = [];

    const subString = string.slice(stringPosition, Infinity);
    const matchResult = regexp.exec(subString);
    const matchedString = getOr("", 0)(matchResult);
    const matchedStringLength = size(matchedString);

    const matchStartIndex = flow([
      getOr(-1, "index"),
      cond([
        [i => i >= 0, i => i + stringPosition],
        [() => true, i => i]
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

  stream.mapAllRegExp = (...args) => {
    let result = [];

    while (stream.hasMore()) {
      result = [...result, ...stream.mapRegExp(...args)];
    }

    return result;
  };

  stream.remainingLength = () => {
    return stringLength - stringPosition;
  };

  stream.hasMore = () => {
    return stream.remainingLength() > 0;
  };

  return stream;
};
