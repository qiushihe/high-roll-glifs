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
  Range
} from "@codemirror/next/view";

import { Extension } from "@codemirror/next/state";

import { adaptStream } from "./stream/adapter";
import lineStream from "./stream/line.stream";
import { parse as gfmParse } from "./gfm.parser";
import { ParserState } from "/src/gfm.parser/type";

type DecorationIndex = { [key: string]: Decoration };
type DecorationMapping = { [key: string]: string };

const LINE_DECORATOR: DecorationIndex = flow([
  (mapping: DecorationMapping) => ({ keys: keys(mapping), mapping }),
  ({ keys, mapping }: { keys: string[]; mapping: DecorationMapping }) =>
    reduce(
      (result: DecorationIndex, key: string) => ({
        ...result,
        [key]: Decoration.line({
          attributes: { class: themeClass(`md-${mapping[key]}`) }
        })
      }),
      {}
    )(keys)
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
  "empty-line": "empty"
});

const INLINE_DECORATOR: DecorationIndex = flow([
  (mapping: DecorationMapping) => ({ keys: keys(mapping), mapping }),
  ({ keys, mapping }: { keys: string[]; mapping: DecorationMapping }) =>
    reduce(
      (result: DecorationIndex, key: string) => ({
        ...result,
        [key]: Decoration.mark({
          attributes: { class: themeClass(`md-${mapping[key]}`) }
        })
      }),
      {}
    )(keys)
])({
  "inline-syntax": "inline-syntax",
  "block-syntax": "block-syntax",
  "code-span": "code-span",
  "link-span": "link-span"
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
      viewportLines.push(view.state.doc.line(i).slice());
    }

    const state: ParserState = { previousLines: [] };
    const stream = lineStream(viewportLines);

    while (!stream.ended()) {
      const parseResult = gfmParse(adaptStream(stream), state);

      if (parseResult) {
        const {
          lineType,
          lineContext,
          inlineTokens,
          inlineContext
        } = parseResult;

        const lineDecorator = LINE_DECORATOR[lineType];
        if (lineDecorator) {
          deco.push(lineDecorator.range(viewport.from + stream.position()));
        }

        state.previousLines = [
          {
            type: lineType,
            context: lineContext,
            inline: { tokens: inlineTokens, context: inlineContext }
          }
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
    color: "#ff0000"
  },
  "test-mark": {
    color: "#ff0000"
  },
  "md-block-syntax": {
    color: "#b0b0b0 !important"
  },
  "md-inline-syntax": {
    color: "#ff0000 !important"
  },
  "md-code-span": {
    backgroundColor: "#e6e6e6"
  },
  "md-link-span": {
    color: "#0000ff"
  }
});

export default (): Extension[] => [gfmTheme, gfmDecorations];
