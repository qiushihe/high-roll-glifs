export interface GfmOracle {
  getCurrentLine: () => string;
  getIndexOnCurrentLine: () => number;
  getLineAtOffset: (offset: number) => string | null;
}
