import {
  AtxHeading,
  Blank,
  BlockQuote,
  Empty,
  FencedCode,
  IndentedCode,
  List,
  Paragraph,
  SettextHeading,
  ThematicBreak
} from "./block";

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

export interface LineState {
  type: string;
  context: LineContext;
}

export interface ParserState {
  previousLines?: LineState[];
}
