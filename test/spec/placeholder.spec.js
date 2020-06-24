import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import eq from "lodash/fp/eq";

import { PASS, FAIL } from "/test/enum/result.enum";
import expectPatterns from "/test/util/expect-patterns.util";

describe("placeholder", () => {
  expectPatterns([
    [FAIL, { value: 1 }],
    [PASS, { value: 2 }]
  ])(params => {
    return flow([get("value"), eq(2)])(params);
  });
});
