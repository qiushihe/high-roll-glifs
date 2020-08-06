import flow from "lodash/fp/flow";
import forEach from "lodash/fp/forEach";
import split from "lodash/fp/split";
import first from "lodash/fp/first";
import isEmpty from "lodash/fp/isEmpty";
import compact from "lodash/fp/compact";
import join from "lodash/fp/join";

export const PASS = true;
export const FAIL = false;

export const adaptLines = string => {
  const lines = split("\n")(string);

  const adapter = {};

  adapter.match = pattern => flow([first, line => line.match(pattern)])(lines);

  adapter.lookAhead = index => lines[index];

  return adapter;
};

export const testAcceptance = rule =>
  forEach(([shouldPass, input, state = {}]) => {
    const result = rule.parse(adaptLines(input), state);
    const stateDescription = isEmpty(state)
      ? ""
      : ` with ${JSON.stringify(state)}`;

    if (shouldPass) {
      it(`should accept ${JSON.stringify(input)}${stateDescription}`, () => {
        expect(result).to.not.be.null;
      });
    } else {
      it(`should not accept ${JSON.stringify(
        input
      )}${stateDescription}`, () => {
        expect(result).to.be.null;
      });
    }
  });

export const testProperties = (rule, prefix = "") => expectations => {
  const description = isEmpty(prefix)
    ? "result attributes"
    : `result ${prefix}.* attributes`;

  describe(description, () => {
    forEach(([name, expected, input, state = {}]) => {
      it(`${JSON.stringify(input)} should produce \`${name}\`: ${JSON.stringify(
        expected
      )}`, () => {
        expect(rule.parse(adaptLines(input), state)).to.have.nested.property(
          flow([compact, join(".")])([prefix, name]),
          expected
        );
      });
    })(expectations);
  });
};

export const lineContext = raw => ({ context: { raw } });
