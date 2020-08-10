export interface LineOracle {
  lineAtOffset: (offset: number) => string | null;
}
