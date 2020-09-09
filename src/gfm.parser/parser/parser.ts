import { BlockContext } from "/src/gfm.parser/parser/block";

export interface LineState {
  type: string;
  context: BlockContext;
  inlineTokens: string[][];
}

export interface ParserState {
  UNUSED_attrPleaseIgnore?: unknown;
}
