import flow from "lodash/fp/flow";
import find from "lodash/fp/find";
import get from "lodash/fp/get";
import eq from "lodash/fp/eq";

import blockQuote from "./block-quote.rule";
import atxHeading from "./atx-heading.rule";
import settextHeading from "./settext-heading.rule";
import thematicBreak from "./thematic-break.rule";
import paragraph from "./paragraph.rule";
import blankLine from "./blank-line.rule";

const ALL_RULES = [
  blockQuote,
  atxHeading,
  settextHeading,
  thematicBreak,
  paragraph,
  blankLine
];

export const getRule = name => {
  return find(flow([get("name"), eq(name)]))(ALL_RULES);
};

export const getAllRules = () => {
  return ALL_RULES;
};
