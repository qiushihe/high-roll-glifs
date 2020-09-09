import identity from "lodash/fp/identity";

export interface AtxHeading {
  prefix: string;
  level: number;
  space: string;
  text: string;
  suffix: string;
}

export interface SettextHeadingUnderline {
  prefix: string;
  text: string;
  suffix: string;
  level: number;
}

export interface BlockQuote {
  prefix: string;
  text: string;
}

export interface ListItem {
  type: string;
  prefix: string;
  digits: string;
  marker: string;
  spaces: string;
  content: string;
}

export interface FencedCodeFence {
  info: string;
}

export interface IndentedCode {
  UNUSED_placeholderAttr?: unknown;
}

export interface Paragraph {
  UNUSED_placeholderAttr?: unknown;
}

export interface ThematicBreak {
  prefix: string;
  text: string;
  suffix: string;
}

export interface Blank {
  UNUSED_placeholderAttr?: unknown;
}

export interface Empty {
  UNUSED_placeholderAttr?: unknown;
}

export interface LineContext {
  raw: string;
  atxHeading?: AtxHeading;
  settextHeadingUnderline?: SettextHeadingUnderline;
  blockQuote?: BlockQuote;
  listItem?: ListItem;
  fencedCodeFence?: FencedCodeFence;
  indentedCode?: IndentedCode;
  paragraph?: Paragraph;
  thematicBreak?: ThematicBreak;
  blank?: Blank;
  empty?: Empty;
}

export class LineContextBuilder {
  static new(raw: string): LineContextBuilder {
    return new LineContextBuilder(raw);
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
    prefix: string,
    level: number,
    space: string,
    text: string,
    suffix: string
  ): LineContextBuilder {
    this.namespace = "atxHeading";
    this.values = identity<AtxHeading>({
      prefix,
      level,
      space,
      text,
      suffix
    });
    return this;
  }

  public settextHeadingUnderline(
    prefix: string,
    text: string,
    suffix: string,
    level: number
  ): LineContextBuilder {
    this.namespace = "settextHeadingUnderline";
    this.values = identity<SettextHeadingUnderline>({
      prefix,
      text,
      suffix,
      level
    });
    return this;
  }

  public blockQuote(prefix: string, text: string): LineContextBuilder {
    this.namespace = "blockQuote";
    this.values = identity<BlockQuote>({ prefix, text });
    return this;
  }

  public listItem(
    type: string,
    prefix: string,
    digits: string,
    marker: string,
    spaces: string,
    content: string
  ): LineContextBuilder {
    this.namespace = "listItem";
    this.values = identity<ListItem>({
      type,
      prefix,
      digits,
      marker,
      spaces,
      content
    });
    return this;
  }

  public fencedCodeFence(info: string): LineContextBuilder {
    this.namespace = "fencedCodeFence";
    this.values = identity<FencedCodeFence>({ info });
    return this;
  }

  public indentedCode(): LineContextBuilder {
    this.namespace = "indentedCode";
    this.values = identity<IndentedCode>({});
    return this;
  }

  public thematicBreak(
    prefix: string,
    text: string,
    suffix: string
  ): LineContextBuilder {
    this.namespace = "thematicBreak";
    this.values = identity<ThematicBreak>({ prefix, text, suffix });
    return this;
  }

  public paragraph(): LineContextBuilder {
    this.namespace = "paragraph";
    this.values = identity<Paragraph>({});
    return this;
  }

  public blank(): LineContextBuilder {
    this.namespace = "blank";
    this.values = identity<Blank>({});
    return this;
  }

  public empty(): LineContextBuilder {
    this.namespace = "empty";
    this.values = identity<Empty>({});
    return this;
  }

  public build(): LineContext {
    if (!this.namespace || this.namespace.length <= 0) {
      throw new Error("unexpected namespace");
    }

    return {
      raw: this.raw,
      [this.namespace]: this.values
    };
  }
}
