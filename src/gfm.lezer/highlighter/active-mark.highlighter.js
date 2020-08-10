import sortBy from "lodash/fp/sortBy";
import get from "lodash/fp/get";
import times from "lodash/fp/times";
import reduce from "lodash/fp/reduce";
import find from "lodash/fp/find";

import {
  Decoration,
  themeClass,
  ViewPlugin,
  EditorView
} from "@codemirror/next/view";

const activeMarkDeco = Decoration.mark({
  attributes: { class: themeClass("md-active-mark") }
});

const activeMarkHighlighter = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = this.getDeco(view);
    }

    update(update) {
      if (update.docChanged || update.selectionSet) {
        this.decorations = this.getDeco(update.view);
      }
    }

    getDeco(view) {
      let deco = [];

      const activeRanges = reduce((result, range) => {
        return [...result, [range.from, range.to]];
      }, [])(view.state.selection.ranges);

      times(lineIndex => {
        const line = view.state.doc.line(lineIndex + 1);
        const isActive = !!find(
          ([from, to]) => !(line.from > to || line.to < from)
        )(activeRanges);

        view.state.tree.iterate({
          from: line.from,
          to: line.to,
          enter: (type, start, end) => {
            // console.log(type.name, line.from, start, end);
            if (type.name === "AtxPrefix") {
              if (isActive) {
                deco.push(activeMarkDeco.range(start, end));
              }
            } else if (type.name === "AtxLevel") {
              if (isActive) {
                deco.push(activeMarkDeco.range(start, end));
              }
            } else if (type.name === "AtxSpace") {
              if (isActive) {
                deco.push(activeMarkDeco.range(start, end));
              }
            } else if (type.name === "AtxSuffix") {
              if (isActive) {
                deco.push(activeMarkDeco.range(start, end));
              }
            } else if (type.name === "ThematicBreakPrefix") {
              if (isActive) {
                deco.push(activeMarkDeco.range(start, end));
              }
            } else if (type.name === "ThematicBreakSuffix") {
              if (isActive) {
                deco.push(activeMarkDeco.range(start, end));
              }
            }
          }
        });
      })(view.state.doc.lines);

      return Decoration.set(sortBy([get("from"), get("to")])(deco));
    }
  }
).decorations();

const activeMarkTheme = EditorView.baseTheme({
  "md-active-mark": {
    color: "inherit",
    fontSize: "inherit"
  }
});

export default () => {
  return [activeMarkTheme, activeMarkHighlighter];
};
