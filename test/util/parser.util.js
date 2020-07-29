import forEach from "lodash/fp/forEach";

import { adaptString } from "/src/gfm.parser/line.adapter";

export const PASS = true;
export const FAIL = false;

export const testAcceptance = rule =>
  forEach(([shouldPass, input]) => {
    const result = rule.parse(adaptString(input));

    if (shouldPass) {
      it(`should accept ${JSON.stringify(input)}`, () => {
        expect(result).to.not.be.null;
      });
    } else {
      it(`should not accept ${JSON.stringify(input)}`, () => {
        expect(result).to.be.null;
      });
    }
  });
