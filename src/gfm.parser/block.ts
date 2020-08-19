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
  restTokens: string[][];
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
