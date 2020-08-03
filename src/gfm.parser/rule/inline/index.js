import reduce from "lodash/fp/reduce";

import blockToken from "./block-token.rule";
import codeSpan from "./code-span.rule";

const RULES = [blockToken, codeSpan];

const RULES_BY_NAME = reduce(
  (result, rule) => ({ ...result, [rule.name]: rule }),
  {}
)(RULES);

export const getRules = () => RULES;

export const getRule = name => {
  return RULES_BY_NAME[name];
};
