import { buildParser as buildLezerParser } from "lezer-generator";

import grammarStr from "!!raw-loader!./gfm.grammar";
import { getEternalTokenizer } from "./gfm.tokens";

export default buildLezerParser(grammarStr, {
  includeNames: true,
  externalTokenizer: getEternalTokenizer
});
