import reduce from "lodash/fp/reduce";

import blockSyntax from "./block-syntax.rule";
import codeSpan from "./code-span.rule";

const RULES = [blockSyntax, codeSpan];

const RULES_BY_NAME = reduce(
  (result, rule) => ({ ...result, [rule.name]: rule }),
  {}
)(RULES);

export const getRules = () => RULES;

export const getRule = name => {
  return RULES_BY_NAME[name];
};
