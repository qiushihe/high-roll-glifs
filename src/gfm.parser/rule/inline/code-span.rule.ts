import size from "lodash/fp/size";
import constant from "lodash/fp/constant";

import { stringStream, MapMatch } from "../../stream/string.stream";
import { ParseInlineRule } from "../../parser";

const CODE_SPAN_REGEXP = new RegExp(
  "((?<!(?<!\\\\)`)((?<!\\\\)`)+(?![`]))(.+?)((?<![`])\\1(?![`]))"
);

const handleUnmatched = constant([]);

const handleMatched: MapMatch = (
  character: string,
  index: number,
  matchResult: RegExpMatchArray | null
): string[] => {
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
    return ["code-span"];
  }
};

const parse: ParseInlineRule = (text: string): string[][] => {
  return stringStream(text).mapAllRegExp(
    CODE_SPAN_REGEXP,
    handleUnmatched,
    handleMatched
  );
};

export default { name: "code-span", parse };
