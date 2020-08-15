// =================================================================
// Stream
// =================================================================

export interface AdaptableStream {
  match: (pattern: RegExp, UNUSED_consume: boolean) => RegExpMatchArray | null;
  lookAhead: (offset: number) => string | null;
}

export interface AdaptedStream {
  match: (pattern: RegExp) => RegExpMatchArray | null;
  lookAhead: (offset: number) => string | null;
}

export interface Stream {
  index: () => number;
  position: () => number;
  text: () => string | null;
  next: () => void;
  ended: () => boolean;
  match: (regexp: RegExp, UNUSED_consume: boolean) => RegExpMatchArray | null;
  lookAhead: (offset: number) => string | null;
}

// =================================================================
// Block Tokens
// =================================================================

export interface AtxHeading {
  level: number;
  prefix: string;
  text: string;
  suffix: string;
}

export interface Blank {
  UNUSED_placeholderAttr?: unknown;
}

export interface BlockQuote {
  prefix: string;
  text: string;
}

export interface Empty {
  UNUSED_placeholderAttr?: unknown;
}

export interface FencedCode {
  info: string;
  fence: string;
  isContinuable: boolean;
}

export interface IndentedCode {
  UNUSED_placeholderAttr?: unknown;
}

export interface List {
  type: string;
  leader: number;
}

export interface Paragraph {
  UNUSED_placeholderAttr?: unknown;
}

export interface SettextHeading {
  level: number;
  prefix: string;
  text: string;
  suffix: string;
  isUnderline: boolean;
}

export interface ThematicBreak {
  prefix: string;
  text: string;
  suffix: string;
}

// =================================================================
// Rule
// =================================================================

export interface LineContext {
  raw: string;
  atxHeading?: AtxHeading;
  settextHeading?: SettextHeading;
  blockQuote?: BlockQuote;
  list?: List;
  fencedCode?: FencedCode;
  indentedCode?: IndentedCode;
  thematicBreak?: ThematicBreak;
  paragraph?: Paragraph;
  blank?: Blank;
  empty?: Empty;
}

export interface ParsedBlock {
  lineType: string;
  lineContext: LineContext;
}

export type ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
) => ParsedBlock | null;

export interface BlockRule {
  name: string;
  parse: ParseBlockRule;
}

export interface InlineContext {
  restTokens?: (string[] | null)[];
}

export interface ParsedInline {
  inlineTokens: (string[] | null)[];
  inlineContext?: InlineContext;
}

export type ParseInlineRule = (
  line: LineState,
  state: ParserState,
  stream: AdaptedStream
) => ParsedInline | null;

export interface InlineRule {
  name: string;
  parse: ParseInlineRule;
}

// =================================================================
// Parser
// =================================================================

export interface InlineState {
  tokens: (string[] | null)[];
  context: InlineContext;
}

export interface LineState {
  type: string;
  context: LineContext;
  inline: InlineState;
}

export interface ParserState {
  previousLines?: LineState[];
}

export interface ParsedStream {
  lineType: string;
  lineContext: LineContext;
  inlineTokens: (string[] | null)[];
  inlineContext: InlineContext;
}

export type ParseStream = (
  stream: AdaptedStream,
  state: ParserState
) => ParsedStream | null;
