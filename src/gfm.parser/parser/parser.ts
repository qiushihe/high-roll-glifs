import { LineContext } from "./line.context";

export interface LineState {
  type: string;
  context: LineContext;
  inlineTokens: string[][];
  restInlineTokens: string[][];
}

export interface ParserStateContext {
  skipInlineTokens?: boolean;
}

export interface ParserState {
  context?: ParserStateContext;
  previousLines?: LineState[];
}

export const shouldParseInlineTokens = (state: ParserState): boolean => {
  return state.context && state.context.skipInlineTokens
    ? !state.context.skipInlineTokens
    : true;
};
