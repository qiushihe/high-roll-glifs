import map from "lodash/fp/map";

export default expectations => getExpectedValue =>
  map(([expectation, value]) => {
    if (expectation) {
      it(`should accept ${JSON.stringify(value)}`, () => {
        expect(getExpectedValue(value)).to.be.true;
      });
    } else {
      it(`should not accept ${JSON.stringify(value)}`, () => {
        expect(getExpectedValue(value)).to.be.false;
      });
    }
  })(expectations);
