import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import isEmpty from "lodash/fp/isEmpty";
import get from "lodash/fp/get";
import last from "lodash/fp/last";

export const resumeInlineTokens = (line, state, contextNamespace) => {
  const { raw } = line;
  const lineSize = size(raw);

  const restTokens = flow([
    get("previousLines"),
    last,
    get(`inline.context.${contextNamespace}.restTokens`)
  ])(state);

  if (!isEmpty(restTokens)) {
    const restTokensCount = size(restTokens);

    // This shouldn't happen in theory (maybe it can happen under certain race conditions during
    // active parsing cycles, I donno) ...
    if (lineSize > restTokensCount) {
      return {
        tokens: [...restTokens, ...Array(lineSize - restTokensCount).fill([])],
        context: { restTokens: [] }
      };
    } else {
      return {
        tokens: restTokens.slice(0, lineSize),
        context: { restTokens: restTokens.slice(lineSize) }
      };
    }
  } else {
    return null;
  }
};
