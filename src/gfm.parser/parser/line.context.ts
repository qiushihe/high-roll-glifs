import identity from "lodash/fp/identity";

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
  ThematicBreak,
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
    level: number,
    prefix: string,
    text: string,
    suffix: string
  ): LineContextBuilder {
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
  ): LineContextBuilder {
    this.namespace = "settextHeading";
    this.values = identity<SettextHeading>({
      prefix,
      text,
      suffix,
      level,
      isUnderline,
    });
    return this;
  }

  public blockQuote(prefix: string, text: string): LineContextBuilder {
    this.namespace = "blockQuote";
    this.values = identity<BlockQuote>({ prefix, text });
    return this;
  }

  public list(type: string, leader: number): LineContextBuilder {
    this.namespace = "list";
    this.values = identity<List>({ type, leader });
    return this;
  }

  public fencedCode(
    info: string,
    fence: string,
    isContinuable: boolean
  ): LineContextBuilder {
    this.namespace = "fencedCode";
    this.values = identity<FencedCode>({ info, fence, isContinuable });
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
      [this.namespace]: this.values,
    };
  }
}
