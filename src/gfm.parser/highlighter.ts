import flow from "lodash/fp/flow";
import sortBy from "lodash/fp/sortBy";
import get from "lodash/fp/get";
import keys from "lodash/fp/keys";
import reduce from "lodash/fp/reduce";

import {
  Decoration,
  DecorationSet,
  themeClass,
  ViewPlugin,
  EditorView,
  ViewUpdate,
  Range,
} from "@codemirror/next/view";

import { Extension } from "@codemirror/next/state";

import { adaptStream } from "./stream/adapter";
import lineStream from "./stream/line.stream";
import { ParserState, parseBlock } from "./parser";

type DecorationIndex = { [key: string]: Decoration };
type DecorationMapping = { [key: string]: string };

const LINE_DECORATOR: DecorationIndex = flow([
  (mapping: DecorationMapping) => ({ keys: keys(mapping), mapping }),
  ({ keys, mapping }: { keys: string[]; mapping: DecorationMapping }) =>
    reduce(
      (result: DecorationIndex, key: string) => ({
        ...result,
        [key]: Decoration.line({
          attributes: { class: themeClass(`md-${mapping[key]}`) },
        }),
      }),
      {}
    )(keys),
])({
  "atx-heading-line": "atx-heading",
  "settext-heading-line": "settext-heading",
  "block-quote-line": "block-quote",
  "paragraph-line": "paragraph",
  "bullet-list-line": "bullet-list",
  "ordered-list-line": "ordered-list",
  "fenced-code-line": "fenced-code",
  "indented-code-line": "indented-code",
  "thematic-break-line": "thematic-break",
  "blank-line": "blank",
  "empty-line": "empty",
});

const INLINE_DECORATOR: DecorationIndex = flow([
  (mapping: DecorationMapping) => ({ keys: keys(mapping), mapping }),
  ({ keys, mapping }: { keys: string[]; mapping: DecorationMapping }) =>
    reduce(
      (result: DecorationIndex, key: string) => ({
        ...result,
        [key]: Decoration.mark({
          attributes: { class: themeClass(`md-${mapping[key]}`) },
        }),
      }),
      {}
    )(keys),
])({
  "block-syntax": "block-syntax",
  "code-span": "code-span",
  "code-span-tick": "code-span-tick",
  "link-span": "link-span",
  "link-span-open": "link-span-open",
  "link-span-close": "link-span-close",
  "image-span": "image-span",
  "image-span-open": "image-span-open",
  "image-span-middle": "image-span-middle",
  "image-span-close": "image-span-close",
});

class GfmDecorator {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.getDeco(view);
  }

  update(update: ViewUpdate): void {
    if (update.docChanged || update.selectionSet || update.viewportChanged) {
      this.decorations = this.getDeco(update.view);
    }
  }

  getDeco(view: EditorView): DecorationSet {
    const deco: Range<Decoration>[] = [];

    const viewport = view.viewport;

    // TODO: Find actual start/end based on finding empty lines, etc.
    const startLineNumber = view.state.doc.lineAt(viewport.from).number;
    const endLineNumber = view.state.doc.lineAt(viewport.to).number;

    const viewportLines = [];
    for (let i = startLineNumber; i <= endLineNumber; i++) {
      const lineText = view.state.doc.line(i).slice();
      viewportLines.push(lineText);
    }

    const state: ParserState = { previousLines: [] };
    const stream = lineStream(viewportLines);

    while (!stream.ended()) {
      const parseResult = parseBlock(adaptStream(stream), state);

      if (parseResult) {
        const {
          lineType,
          lineContext,
          inlineTokens,
          restInlineTokens,
        } = parseResult;

        const lineDecorator = LINE_DECORATOR[lineType];
        if (lineDecorator) {
          deco.push(lineDecorator.range(viewport.from + stream.position()));
        }

        state.previousLines = [
          {
            type: lineType,
            context: lineContext,
            inlineTokens,
            restInlineTokens,
          },
        ];

        for (
          let inlineIndex = 0;
          inlineIndex < inlineTokens.length;
          inlineIndex++
        ) {
          const tokensAtIndex = inlineTokens[inlineIndex] || [];

          for (
            let tokenIndex = 0;
            tokenIndex < tokensAtIndex.length;
            tokenIndex++
          ) {
            const inlineDecorator = INLINE_DECORATOR[tokensAtIndex[tokenIndex]];
            if (inlineDecorator) {
              const inlinePosition =
                viewport.from + stream.position() + inlineIndex;
              deco.push(
                inlineDecorator.range(inlinePosition, inlinePosition + 1)
              );
            }
          }
        }
      }

      stream.next();
    }

    return Decoration.set(sortBy([get("from"), get("to")])(deco));
  }
}

const gfmDecorations = ViewPlugin.fromClass(GfmDecorator).decorations();

const gfmTheme = EditorView.baseTheme({
  "test-line": {
    color: "#ff0000",
  },
  "test-mark": {
    color: "#ff0000",
  },
  "md-block-syntax": {
    color: "#b0b0b0 !important",
  },
  "md-code-span": {
    backgroundColor: "#e6e6e6",
  },
  "md-code-span-tick": {
    color: "#b0b0b0 !important",
  },
  "md-link-span": {
    color: "#0000ff",
  },
  "md-link-span-open": {
    color: "#b0b0b0 !important",
  },
  "md-link-span-close": {
    color: "#b0b0b0 !important",
  },
  "md-image-span": {
    color: "#0000ff",
  },
  "md-image-span-open": {
    color: "#b0b0b0 !important",
  },
  "md-image-span-middle": {
    color: "#b0b0b0 !important",
  },
  "md-image-span-close": {
    color: "#b0b0b0 !important",
  },
});

export default (): Extension[] => [gfmTheme, gfmDecorations];
