import {adaptString} from "/src/gfm.parser/line.adapter";
import rule from "/src/gfm.parser/block-rule/blank.rule";

describe("gfm.parser / block-rule / block.rule", () => {
  it("should not accept empty line", () => {
    const result = rule.parse(adaptString(""));
    expect(result).to.be.null;
  });

  it("should accept line with only whitespace characters", () => {
    const result = rule.parse(adaptString("   "));
    expect(result).to.not.be.null;
    expect(result).to.have.nested.property("lineType", "blank-line");
    expect(result).to.have.nested.property("lineContext.raw", "   ");
  });
});
