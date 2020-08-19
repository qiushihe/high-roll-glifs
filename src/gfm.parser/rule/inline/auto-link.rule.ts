import constant from "lodash/fp/constant";
import cond from "lodash/fp/cond";
import eq from "lodash/fp/eq";
import stubTrue from "lodash/fp/stubTrue";

import { stringStream } from "../../stream/string.stream";
import { ParseInlineRule } from "../../inline.parser";

// TODO: Make this expression great again.
const AUTO_LINK_REGEXP = new RegExp("<([^<>]*)>");

const handleUnmatched = constant([]);

const handleMatched = cond([
  [eq("<"), constant(["link-span", "link-span-open"])],
  [eq(">"), constant(["link-span", "link-span-close"])],
  [stubTrue, constant(["link-span"])]
]);

const parse: ParseInlineRule = (text: string): string[][] => {
  return stringStream(text).mapAllRegExp(
    AUTO_LINK_REGEXP,
    handleUnmatched,
    handleMatched
  );
};

export default { name: "auto-link", parse };
