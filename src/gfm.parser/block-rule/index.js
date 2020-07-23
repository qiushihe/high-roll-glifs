import reduce from "lodash/fp/reduce";

import blockQuoteRule from "./block-quote.rule";
import listRule from "./list.rule";
import atxHeadingRule from "./atx-heading.rule";
import settextHeadingRule from "./settext-heading.rule";
import indentedCodeRule from "./indented-code.rule";
import fencedCodeRule from "./fenced-code.rule";
import thematicBreakRule from "./thematic-break.rule";
import paragraphRule from "./paragraph.rule";
import blankRule from "./blank.rule";
import emptyRule from "./empty.rule";

const RULES = [
  fencedCodeRule,
  blockQuoteRule,
  listRule,
  atxHeadingRule,
  settextHeadingRule,
  indentedCodeRule,
  thematicBreakRule,
  paragraphRule,
  blankRule,
  emptyRule
];

const RULES_BY_NAME = reduce(
  (result, rule) => ({ ...result, [rule.name]: rule }),
  {}
)(RULES);

export const getRules = () => RULES;

export const getRule = name => {
  return RULES_BY_NAME[name];
};
