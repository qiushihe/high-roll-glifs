import size from "lodash/fp/size";
import isNil from "lodash/fp/isNil";

export default ({ rules, tokens, lines, index }) => {
  let resultTokens = tokens;
  let ruleIndex = 0;

  while (true) {
    if (ruleIndex >= size(rules)) {
      break;
    }

    const rule = rules[ruleIndex];
    const ruleTokens = rule.parse({ tokens, lines, index });

    if (!isNil(ruleTokens)) {
      resultTokens = ruleTokens;
      break;
    }

    ruleIndex += 1;
  }

  return resultTokens;
};
