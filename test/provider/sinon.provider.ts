import sinon, { SinonStatic } from "sinon";

type CombinedGlobal = NodeJS.Global & typeof globalThis;

interface GlobalWithSinon extends CombinedGlobal {
  sinon: SinonStatic;
}

(global as GlobalWithSinon).sinon = sinon;

declare global {
  const sinon: SinonStatic;
}
