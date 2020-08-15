import Chai from "chai";
import sinonChai from "sinon-chai";

type CombinedGlobal = NodeJS.Global & typeof globalThis;

interface GlobalWithChai extends CombinedGlobal {
  chai: Chai.ChaiStatic;
  expect: Chai.ExpectStatic;
}

Chai.use(sinonChai);

(global as GlobalWithChai).expect = Chai.expect;
(global as GlobalWithChai).chai = Chai;

declare global {
  const expect: Chai.ExpectStatic;

  // It's unnecessary to declare `chai` in the `global` namspace here because `chai` is already
  // declared globally by the `chai` package (but we still have to set it globally above).
  // const chai: Chai.ChaiStatic;
}
