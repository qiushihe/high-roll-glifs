import DummyHelper from "/src/util/dummy.util";
import DummyTestHelper from "/test/util/dummy.util";

describe("Dummy test", () => {
  it("should pass", () => {
    expect(DummyHelper()).to.eq("Dummy source helper!");
  });

  it("should pass again", () => {
    expect(DummyTestHelper()).to.eq("Dummy test helper!");
  });
});
