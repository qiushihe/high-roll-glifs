import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import getOr from "lodash/fp/getOr";
import cond from "lodash/fp/cond";

export const stringStream = string => {
  const stream = {};

  const stringLength = size(string);
  let stringPosition = 0;

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
            matchedIterator(character, matchedStringPosition, matchedString)
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
