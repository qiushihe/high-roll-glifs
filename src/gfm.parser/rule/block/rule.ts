import find from "lodash/fp/find";

import { BlockRule } from "../../type";

import atxHeadingRule from "./atx-heading.rule";
import settextHeadingRule from "./settext-heading.rule";
import blockQuoteRule from "./block-quote.rule";
import listRule from "./list.rule";
import fencedCodeRule from "./fenced-code.rule";
import indentedCodeRule from "./indented-code.rule";
import thematicBreakRule from "./thematic-break.rule";
import paragraphRule from "./paragraph.rule";
import blankRule from "./blank.rule";
import emptyRule from "./empty.rule";

export const getRules = (): BlockRule[] => [
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

export const getRule = (name: string): BlockRule => {
  const rule = find((rule: BlockRule) => rule.name === name)(getRules());
  if (rule) {
    return rule;
  } else {
    throw new Error(`Unable to find block rule: ${name}`);
  }
};
