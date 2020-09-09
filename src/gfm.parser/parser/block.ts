import identity from "lodash/fp/identity";

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

export interface BlockContext {
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

export class BlockContextBuilder {
  static new(raw: string): BlockContextBuilder {
    return new BlockContextBuilder(raw);
  }

  private readonly raw: string;
  private namespace: string;
  private values: unknown;

  private constructor(raw: string) {
    this.raw = raw;
    this.namespace = "";
    this.values = {};
  }

  public atxHeading(
    level: number,
    prefix: string,
    text: string,
    suffix: string
  ): BlockContextBuilder {
    this.namespace = "atxHeading";
    this.values = identity<AtxHeading>({ level, prefix, text, suffix });
    return this;
  }

  public settextHeading(
    prefix: string,
    text: string,
    suffix: string,
    level: number,
    isUnderline: boolean
  ): BlockContextBuilder {
    this.namespace = "settextHeading";
    this.values = identity<SettextHeading>({
      prefix,
      text,
      suffix,
      level,
      isUnderline
    });
    return this;
  }

  public blockQuote(prefix: string, text: string): BlockContextBuilder {
    this.namespace = "blockQuote";
    this.values = identity<BlockQuote>({ prefix, text });
    return this;
  }

  public list(type: string, leader: number): BlockContextBuilder {
    this.namespace = "list";
    this.values = identity<List>({ type, leader });
    return this;
  }

  public fencedCode(
    info: string,
    isOpenFence: boolean,
    isCloseFence: boolean
  ): BlockContextBuilder {
    this.namespace = "fencedCode";
    this.values = identity<FencedCode>({ info, isOpenFence, isCloseFence });
    return this;
  }

  public indentedCode(): BlockContextBuilder {
    this.namespace = "indentedCode";
    this.values = identity<IndentedCode>({});
    return this;
  }

  public thematicBreak(
    prefix: string,
    text: string,
    suffix: string
  ): BlockContextBuilder {
    this.namespace = "thematicBreak";
    this.values = identity<ThematicBreak>({ prefix, text, suffix });
    return this;
  }

  public paragraph(): BlockContextBuilder {
    this.namespace = "paragraph";
    this.values = identity<Paragraph>({});
    return this;
  }

  public blank(): BlockContextBuilder {
    this.namespace = "blank";
    this.values = identity<Blank>({});
    return this;
  }

  public empty(): BlockContextBuilder {
    this.namespace = "empty";
    this.values = identity<Empty>({});
    return this;
  }

  public build(): BlockContext {
    if (!this.namespace || this.namespace.length <= 0) {
      throw new Error("unexpected namespace");
    }

    return {
      raw: this.raw,
      [this.namespace]: this.values
    };
  }
}
