import { GfmOracle } from "../oracle.type";

export type BlockInlineStyles = (string[] | null)[];

export interface AtxHeading {
  type: string;
  prefix: string;
  level: string;
  space: string;
  text: string;
  suffix: string;
}

export interface SettextHeading {
  type: string;
  isUnderline: boolean;
  prefix: string;
  text: string;
  suffix: string;
}

export interface BlockQuote {
  type: string;
  prefix: string;
  text: string;
}

export interface ThematicBreak {
  type: string;
  prefix: string;
  text: string;
  suffix: string;
}

export interface Paragraph {
  type: string;
  text: string;
  inlineStyles: BlockInlineStyles;
}

export interface Blank {
  type: string;
  text: string;
}

export type Block =
  | AtxHeading
  | SettextHeading
  | BlockQuote
  | ThematicBreak
  | Paragraph
  | Blank;

export type blockRuleParser = (line: string, oracle: GfmOracle) => Block | null;
