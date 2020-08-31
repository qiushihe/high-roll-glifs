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
  isOpenFence: boolean;
  isCloseFence: boolean;
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
