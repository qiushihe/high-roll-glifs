import size from "lodash/fp/size";
import constant from "lodash/fp/constant";

import { stringStream, MapMatch } from "../../stream/string.stream";
import { ParseInlineRule } from "../../parser";

const IMAGE_SPAN_REGEXP = new RegExp('!\\[(.*)]\\((.*?)(\\s+"([^"]*)")?\\)');

const handleUnmatched = constant([]);

const handleMatched: MapMatch = (
  character: string,
  index: number,
  matchResult: RegExpMatchArray | null
): string[] => {
  if (matchResult) {
    const totalLength = size(matchResult[0]);
    const descriptionLength = size(matchResult[1]);

    if (index < 2) {
      return ["image-span", "image-span-open"];
    } else if (
      index >= 2 + descriptionLength &&
      index < 2 + descriptionLength + 2
    ) {
      return ["image-span", "image-span-middle"];
    } else if (index >= totalLength - 1) {
      return ["image-span", "image-span-close"];
    }
    {
      return ["image-span"];
    }
  } else {
    return ["image-span"];
  }
};

const parse: ParseInlineRule = (text: string): string[][] => {
  return stringStream(text).mapAllRegExp(
    IMAGE_SPAN_REGEXP,
    handleUnmatched,
    handleMatched
  );
};

export default { name: "image-span", parse };
