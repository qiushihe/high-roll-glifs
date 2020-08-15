import atxHeadingRule from "./atx-heading.rule";
import settextHeadingRule from "./settext-heading.rule";
import blockQuoteRule from "./block-quote.rule";
import thematicBreakRule from "./thematic-break.rule";
import paragraphRule from "./paragraph.rule";
import blankRule from "./blank.rule";

import { blockRuleParser } from "./type";

export const getRules = (): { name: string; parse: blockRuleParser }[] => [
  atxHeadingRule,
  settextHeadingRule,
  blockQuoteRule,
  thematicBreakRule,
  paragraphRule,
  blankRule
];
