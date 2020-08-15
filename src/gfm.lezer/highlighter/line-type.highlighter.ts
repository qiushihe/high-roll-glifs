import flow from "lodash/fp/flow";
import sortBy from "lodash/fp/sortBy";
import get from "lodash/fp/get";
import times from "lodash/fp/times";
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

const LINE_DECORATOR: { [key: string]: Decoration } = flow([
  mapping => ({ keys: keys(mapping), mapping }),
  ({ keys, mapping }) =>
    reduce(
      (result, key: string) => ({
        ...result,
        [key]: Decoration.line({
          attributes: { class: themeClass(`md-${mapping[key]}`) }
        })
      }),
      {}
    )(keys)
])({
  AtxHeading: "atx-heading",
  SettextHeading: "settext-heading",
  SettextHeadingUnderline: "settext-heading-underline",
  ThematicBreak: "thematic-break",
  BlockQuote: "block-quote",
  Paragraph: "paragraph",
  Blank: "blank",
  Empty: "empty"
});

class LineTypeDecorator {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.getDeco(view);
  }

  update(update: ViewUpdate): void {
    if (update.docChanged || update.selectionSet) {
      this.decorations = this.getDeco(update.view);
    }
  }

  getDeco(view: EditorView): DecorationSet {
    const deco: Range<Decoration>[] = [];

    times(lineIndex => {
      const line = view.state.doc.line(lineIndex + 1);

      view.state.tree.iterate({
        from: line.from,
        to: line.to,
        enter: (type, start, UNUSED_end) => {
          // console.log(type.name, line.from, start, end);

          if (line.from === start) {
            // console.log(type.name, line.from, start, end);
            const decorator = LINE_DECORATOR[type.name];

            if (decorator) {
              deco.push(decorator.range(line.from));
            }
          }
        }
      });
    })(view.state.doc.lines);

    return Decoration.set(sortBy([get("from"), get("to")])(deco));
  }
}

const lineTypeDecorations = ViewPlugin.fromClass(
  LineTypeDecorator
).decorations();

export default (): Extension[] => {
  return [lineTypeDecorations];
};
