import find from "lodash/fp/find";

import { InlineRule } from "../../type";

import blockToken from "./block-token.rule";
import codeSpan from "./code-span.rule";
import autoLink from "./auto-link.rule";

export const getRules = (): InlineRule[] => [blockToken, codeSpan, autoLink];

export const getRule = (name: string): InlineRule => {
  const rule = find((rule: InlineRule) => rule.name === name)(getRules());
  if (rule) {
    return rule;
  } else {
    throw new Error(`Unable to find inline rule: ${name}`);
  }
};
