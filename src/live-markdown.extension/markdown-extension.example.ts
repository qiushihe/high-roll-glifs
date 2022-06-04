import {
  MarkdownConfig,
  InlineContext,
  BlockContext,
  Line
} from "@lezer/markdown";

const HighlightDelim = { resolve: "Highlight", mark: "HighlightMark" };

export const Highlight: MarkdownConfig = {
  defineNodes: ["Highlight", "HighlightMark"],
  parseInline: [
    {
      name: "Highlight",
      parse(cx: InlineContext, next: number, pos: number): number {
        if (next != 61 /* '=' */ || cx.char(pos + 1) != 61) return -1;
        return cx.addDelimiter(HighlightDelim, pos, pos + 2, true, true);
      },
      after: "Emphasis"
    }
  ]
};

export const TestMarkdownInline: MarkdownConfig = {
  defineNodes: ["TestMarkdown"],
  parseInline: [
    {
      name: "TestMarkdownInline",
      parse(cx: InlineContext, next: number, pos: number): number {
        console.log(
          "cx",
          cx,
          "next",
          next,
          "pos",
          pos,
          "cx.char",
          cx.char(pos - 1)
        );
        return -1;
      }
    }
  ]
};

export const TestMarkdownBlock: MarkdownConfig = {
  defineNodes: ["TestMarkdownBlock"],
  parseBlock: [
    {
      name: "TestMarkdownBlock",
      parse(cx: BlockContext, line: Line): boolean {
        console.log("cx", cx, "line", line);
        return false;
      }
    }
  ]
};
