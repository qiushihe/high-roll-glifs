import flow from "lodash/fp/flow";
import sortBy from "lodash/fp/sortBy";
import get from "lodash/fp/get";
import keys from "lodash/fp/keys";
import reduce from "lodash/fp/reduce";
// import includes from "lodash/fp/includes";

import {
  Decoration,
  DecorationSet,
  themeClass,
  ViewPlugin,
  EditorView,
  ViewUpdate,
  Range
  // WidgetType
} from "@codemirror/next/view";

import { Extension } from "@codemirror/next/state";

import {
  ATX_HEADING_BLOCK,
  SETTEXT_HEADING_BLOCK,
  BLOCK_QUOTE_BLOCK,
  BULLET_LIST_BLOCK,
  ORDERED_LIST_BLOCK,
  FENCED_CODE_BLOCK,
  INDENTED_CODE_BLOCK,
  THEMATIC_BREAK_BLOCK,
  PARAGRAPH_BLOCK,
  BLANK_BLOCK,
  EMPTY_BLOCK
} from "./rule/block/type";

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
          attributes: { class: themeClass(`md-${mapping[key]}`) }
        })
      }),
      {}
    )(keys)
])({
  [ATX_HEADING_BLOCK]: "atx-heading",
  [SETTEXT_HEADING_BLOCK]: "settext-heading",
  [BLOCK_QUOTE_BLOCK]: "block-quote",
  [BULLET_LIST_BLOCK]: "bullet-list",
  [ORDERED_LIST_BLOCK]: "ordered-list",
  [FENCED_CODE_BLOCK]: "fenced-code",
  [INDENTED_CODE_BLOCK]: "indented-code",
  [THEMATIC_BREAK_BLOCK]: "thematic-break",
  [PARAGRAPH_BLOCK]: "paragraph",
  [BLANK_BLOCK]: "blank",
  [EMPTY_BLOCK]: "empty"
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
  "block-syntax": "block-syntax",
  "atx-heading-level-1": "atx-heading-level-1",
  "atx-heading-level-2": "atx-heading-level-2",
  "atx-heading-level-3": "atx-heading-level-3",
  "atx-heading-level-4": "atx-heading-level-4",
  "atx-heading-level-5": "atx-heading-level-5",
  "atx-heading-level-6": "atx-heading-level-6",
  "blockquote-prefix": "blockquote-prefix",
  "list-leader": "list-leader",
  "code-span": "code-span",
  "code-span-tick": "code-span-tick",
  "link-span": "link-span",
  "link-span-open": "link-span-open",
  "link-span-close": "link-span-close",
  "image-span": "image-span",
  "image-span-open": "image-span-open",
  "image-span-middle": "image-span-middle",
  "image-span-close": "image-span-close"
});

// class ImageWidget extends WidgetType<string> {
//   toDOM(UNUSED_view: EditorView): HTMLElement {
//     const node = document.createElement("span");
//     node.textContent = "IMAGE-WIDGET";
//     return node;
//   }
// }

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

    const state: ParserState = {};
    const stream = lineStream(viewportLines);

    // let tmpImageStart = -1;
    // let tmpImageEnd = -1;

    while (!stream.ended()) {
      const blocks = parseBlock(adaptStream(stream), state);

      for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
        const block = blocks[blockIndex];

        const { type, inlineTokens } = block;

        const lineDecorator = LINE_DECORATOR[type];
        if (lineDecorator) {
          deco.push(lineDecorator.range(viewport.from + stream.position()));
        }

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
                // The extra `+ 1` for the `to` value is because for CodeMirror's `RangeValue`,
                // the `to` value is not inclusive so we have to `+ 1` to compensate.
                inlineDecorator.range(inlinePosition, inlinePosition + 1)
              );
            }
          }
        }

        // Advance the stream to the next line for each block result.
        stream.next();
      }

      // if (tmpImageStart < 0 || tmpImageEnd < 0) {
      //   if (includes("image-span")(tokensAtIndex)) {
      //     if (tmpImageStart < 0) {
      //       tmpImageStart = viewport.from + stream.position() + inlineIndex;
      //     } else {
      //       if (!includes("image-span")(inlineTokens[inlineIndex + 1])) {
      //         tmpImageEnd = viewport.from + stream.position() + inlineIndex;
      //       }
      //     }
      //   }
      // }
    }

    // if (tmpImageStart >= 0 && tmpImageEnd >= 0) {
    //   let renderWidget = true;
    //
    //   for (
    //     let rangeIndex = 0;
    //     rangeIndex < view.state.selection.ranges.length;
    //     rangeIndex++
    //   ) {
    //     const { from, to } = view.state.selection.ranges[rangeIndex];
    //
    //     if (from <= tmpImageStart && to >= tmpImageEnd + 1) {
    //       renderWidget = false;
    //     } else if (from >= tmpImageStart && from <= tmpImageEnd + 1) {
    //       renderWidget = false;
    //     } else if (to >= tmpImageStart && to <= tmpImageEnd + 1) {
    //       renderWidget = false;
    //     }
    //   }
    //
    //   if (renderWidget) {
    //     deco.push(
    //       Decoration.replace({ widget: new ImageWidget("test") }).range(
    //         tmpImageStart,
    //         tmpImageEnd + 1
    //       )
    //     );
    //   }
    // }

    return Decoration.set(sortBy([get("from"), get("to")])(deco));
  }
}

const gfmDecorations = ViewPlugin.fromClass(GfmDecorator, {
  decorations: get("decorations")
});

const gfmTheme = EditorView.baseTheme({
  "$md-block-syntax": {
    color: "#b0b0b0 !important"
  },
  "$md-code-span": {
    backgroundColor: "#e6e6e6"
  },
  "$md-code-span-tick": {
    color: "#b0b0b0 !important"
  },
  "$md-link-span": {
    color: "#0000ff"
  },
  "$md-link-span-open": {
    color: "#b0b0b0 !important"
  },
  "$md-link-span-close": {
    color: "#b0b0b0 !important"
  },
  "$md-image-span": {
    color: "#0000ff"
  },
  "$md-image-span-open": {
    color: "#b0b0b0 !important"
  },
  "$md-image-span-middle": {
    color: "#b0b0b0 !important"
  },
  "$md-image-span-close": {
    color: "#b0b0b0 !important"
  }
});

export default (): Extension[] => [gfmTheme, gfmDecorations];
