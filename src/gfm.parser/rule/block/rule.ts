import { ParseBlockRule } from "../../parser";

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

export interface BlockRule {
  name: string;
  parse: ParseBlockRule;
}

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
  emptyRule,
];
