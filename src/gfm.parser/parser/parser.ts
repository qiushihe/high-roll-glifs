import { LineContext } from "./line.context";

export interface LineState {
  type: string;
  context: LineContext;
  inlineTokens: string[][];
}

export interface ParserStateContext {
  skipInlineTokens?: boolean;
  skipContinuationLines?: boolean;
}

export interface ParserState {
  context?: ParserStateContext;
}

export const shouldParseInlineTokens = (state: ParserState): boolean => {
  return state.context && state.context.skipInlineTokens
    ? !state.context.skipInlineTokens
    : true;
};

export const shouldParseContinuationLines = (state: ParserState): boolean => {
  return state.context && state.context.skipContinuationLines
    ? !state.context.skipContinuationLines
    : true;
};
