import { GfmOracle } from "/src/gfm.rule/oracle.type";

export interface StreamTokenizerResult {
  term: string;
  end: number;
}

export type StreamTokenizer = (
  position: number,
  oracle: GfmOracle
) => StreamTokenizerResult | null;
