import { ParseLineRule } from "../../parser";

import headingRule from "./heading.rule";
import quoteRule from "./quote.rule";
import listRule from "./list.rule";
import codeRule from "./code.rule";
import breakRule from "./break.rule";
import paragraphRule from "./paragraph.rule";
import whitespaceRule from "./whitespace.rule";

export interface LineRule {
  name: string;
  parse: ParseLineRule;
}

export const getRules = (): LineRule[] => [
  headingRule,
  quoteRule,
  listRule,
  codeRule,
  breakRule,
  paragraphRule,
  whitespaceRule
];
