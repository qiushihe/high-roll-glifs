import chai, { expect } from "chai";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

global.chai = chai;
global.expect = expect;
