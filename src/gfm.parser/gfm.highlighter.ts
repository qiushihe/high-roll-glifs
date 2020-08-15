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

import { adaptStream } from "./line.adapter";
import { parse as gfmParse } from "./gfm.parser";

type DecorationIndex = { [key: string]: Decoration };
type DecorationMapping = { [key: string]: string };

const LINE_DECORATOR: DecorationIndex = flow([
  (mapping: DecorationMapping) => ({ keys: keys(mapping), mapping }),
  ({ keys, mapping }: {keys: string[], mapping: DecorationMapping}) =>
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
  "empty-line": "empty",
});

const INLINE_DECORATOR: DecorationIndex = flow([
  (mapping: DecorationMapping) => ({ keys: keys(mapping), mapping }),
  ({ keys, mapping }: {keys: string[], mapping: DecorationMapping}) =>
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

interface LineStreamLineState {
  type: string;
  context: unknown;
  inline: {
    tokens: string[][];
    context: unknown;
  }
}

interface LineStreamState {
  previousLines: LineStreamLineState[]
}

interface LineStream {
  index: () => number;
  position: () => number;
  text: () => string | null;
  next: () => void;
  ended: () => boolean;
  match: (regexp: RegExp, UNUSED_consume: boolean) => RegExpMatchArray | null;
  lookAhead: (offset: number) => string | null;
}

const lineStream = (lines: string[]): LineStream => {
  let lineIndex = 0;

  const index = (): number => lineIndex;

  const position = (): number => {
    const lengthBefore = lines.slice(0, lineIndex).join("\n").length;
    return lengthBefore <= 0 ? 0 : lengthBefore + 1;
  };

  const text = (): string | null => lines[lineIndex];

  const next = () => { lineIndex += 1; };

  const ended = (): boolean => lineIndex >= lines.length;

  const match = (regexp: RegExp): RegExpMatchArray | null => {
    const line = text();
    return line === null || line === undefined ? null : line.match(regexp);
  };

  const lookAhead = (offset: number): string | null => lines[lineIndex + offset];

  return { index, position, text, next, ended, match, lookAhead };
};

class TestDecorator {
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

    const state: LineStreamState = { previousLines: [] };
    const stream = lineStream(viewportLines);

    while (!stream.ended()) {
      const { lineType, lineContext, inlineTokens, inlineContext } = gfmParse(adaptStream(stream), state);

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

      for (let inlineIndex = 0; inlineIndex < inlineTokens.length; inlineIndex++) {
        for (let tokenIndex = 0; tokenIndex < inlineTokens[inlineIndex].length; tokenIndex++) {
          const inlineDecorator = INLINE_DECORATOR[inlineTokens[inlineIndex][tokenIndex]];
          if (inlineDecorator) {
            const inlinePosition = viewport.from + stream.position() + inlineIndex;
            deco.push(inlineDecorator.range(inlinePosition, inlinePosition + 1));
          }
        }
      }

      stream.next();
    }

    return Decoration.set(sortBy([get("from"), get("to")])(deco));
  }
}

const testDecorations = ViewPlugin.fromClass(
  TestDecorator
).decorations();

const testTheme = EditorView.baseTheme({
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

export default (): Extension[] => [testTheme, testDecorations];
