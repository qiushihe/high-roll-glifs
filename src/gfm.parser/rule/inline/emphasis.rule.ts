import constant from "lodash/fp/constant";

import { stringStream, MapMatch } from "../../stream/string.stream";
import { ParseInlineRule } from "../../parser";

const EMPHASIS_ASTERISK_REGEXP = new RegExp(
  "((?<!(?<!\\\\)\\*)((?<!\\\\)\\*)+(?![*]))(.+?)((?<![*])\\1(?![*]))"
);

const EMPHASIS_UNDERSCORE_REGEXP = new RegExp(
  "((?<!(?<!\\\\)_)((?<!\\\\)_)+(?![_]))(.+?)((?<![_])\\1(?![_]))"
);

const handleUnmatched = constant([]);

const handleMatched: MapMatch = (
  character: string,
  index: number,
  matchResult: RegExpMatchArray | null
): string[] => {
  if (matchResult) {
    const emphasisCharacter = matchResult[2];
    const emphasisType = emphasisCharacter === "*" ? "asterisk" : "underscore";

    const openLength = matchResult[1].length;
    const textLength = matchResult[3].length;
    const closeLength = matchResult[4].length;

    if (index < openLength) {
      return [
        "emphasis",
        `emphasis-${emphasisType}`,
        `emphasis-${emphasisType}-mark`
      ];
    } else if (
      index >= openLength + textLength &&
      index < openLength + textLength + closeLength
    ) {
      return [
        "emphasis",
        `emphasis-${emphasisType}`,
        `emphasis-${emphasisType}-mark`
      ];
    } else {
      return ["emphasis", `emphasis-${emphasisType}`];
    }
  } else {
    return ["emphasis"];
  }
};

// Higher-order matched handler to recursively parse any nested emphasis.
const handleNested = (iterator: MapMatch): MapMatch => {
  // Declare a internal array to hold pending nested emphasis tokens.
  // These "extra" tokens will later be merged with the "regular" (i.e. non-nested) tokens before
  // the final result is returned for each non-nested, matched positions.
  let extraTokens: string[][] = [];

  return (...args) => {
    const [, matchedStringPosition, matchResult] = args;

    if (matchResult) {
      const matchedString = matchResult[0];

      // Because the "matched handler" is called for each position of the matched string, we should
      // only perform nested parsing when on position `0` so we only perform nested parsing once
      // per matched non-nested strings.
      if (matchedStringPosition === 0) {
        // Determine the "mark" length.
        // i.e. for "**a test**", the mark length is `2` because of `**`.
        const markLength = matchResult[1].length;

        // Remove leading and trailing marks to get the nested string.
        const nestedString = matchedString
          .slice(0, matchedString.length - markLength)
          .slice(markLength);

        // Parse the nested string.
        const nestedTokens = stringStream(nestedString).mapAllRegExp(
          [EMPHASIS_ASTERISK_REGEXP, EMPHASIS_UNDERSCORE_REGEXP],
          handleUnmatched,
          handleNested(handleMatched)
        );

        // Prepend and append `[]` of length equal to mark length back to the resulting nested
        // tokens so the total extra tokens length equal to the non-nested string length.
        extraTokens = [
          ...Array(markLength).fill([]),
          ...nestedTokens,
          ...Array(markLength).fill([])
        ];
      }

      // While iterating over each matched position, return ...
      return [
        // ... both the regular, non-nested tokens ...
        ...iterator(...args),
        // ... as well as nested tokens.
        ...extraTokens[matchedStringPosition]
      ];
    } else {
      return iterator(...args);
    }
  };
};

const parse: ParseInlineRule = (text: string): string[][] => {
  return stringStream(text).mapAllRegExp(
    [EMPHASIS_ASTERISK_REGEXP, EMPHASIS_UNDERSCORE_REGEXP],
    handleUnmatched,
    handleNested(handleMatched)
  );
};

export default { name: "emphasis", parse };
