import sortBy from "lodash/fp/sortBy";
import get from "lodash/fp/get";
import times from "lodash/fp/times";

import {
  Decoration,
  themeClass,
  ViewPlugin,
  EditorView
} from "@codemirror/next/view";

const LINE_DECORATOR = {
  ["AtxHeading"]: Decoration.line({
    attributes: { class: themeClass("md-atx-heading") }
  }),
  ["SettextHeading"]: Decoration.line({
    attributes: { class: themeClass("md-settext-heading") }
  }),
  ["SettextHeadingUnderline"]: Decoration.line({
    attributes: { class: themeClass("md-settext-heading-underline") }
  }),
  ["ThematicBreak"]: Decoration.line({
    attributes: { class: themeClass("md-thematic-break") }
  }),
  ["Paragraph"]: Decoration.line({
    attributes: { class: themeClass("md-paragraph") }
  }),
  ["Blank"]: Decoration.line({ attributes: { class: themeClass("md-blank") } }),
  ["Empty"]: Decoration.line({ attributes: { class: themeClass("md-empty") } })
};

const HEADING_LEVEL_DECORATOR = {
  atx: [
    Decoration.line({
      attributes: { class: themeClass("md-atx-heading-level-1") }
    }),
    Decoration.line({
      attributes: { class: themeClass("md-atx-heading-level-2") }
    }),
    Decoration.line({
      attributes: { class: themeClass("md-atx-heading-level-3") }
    }),
    Decoration.line({
      attributes: { class: themeClass("md-atx-heading-level-4") }
    }),
    Decoration.line({
      attributes: { class: themeClass("md-atx-heading-level-5") }
    }),
    Decoration.line({
      attributes: { class: themeClass("md-atx-heading-level-6") }
    })
  ],
  settext: [
    Decoration.line({
      attributes: { class: themeClass("md-settext-heading-level-1") }
    }),
    Decoration.line({
      attributes: { class: themeClass("md-settext-heading-level-2") }
    })
  ]
};

const inlineStyleHighlighter = ViewPlugin.fromClass(
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

      times(lineIndex => {
        const line = view.state.doc.line(lineIndex + 1);

        let atxHeadingLevel = 0;
        let settextHeadingLevel = 0;

        view.state.tree.iterate({
          from: line.from,
          to: line.to,
          enter: (type, start, end) => {
            // console.log(type.name, line.from, start, end);
            if (line.from === start) {
              const decorator = LINE_DECORATOR[type.name];

              if (decorator) {
                deco.push(decorator.range(line.from));
              }
            }

            if (type.name === "AtxLevel") {
              const lineText = view.state.doc
                .lineAt(line.from)
                .slice(start - line.from, end - line.from);
              atxHeadingLevel = lineText.length;
            } else if (type.name === "SettextHeading") {
              const lineNumber = view.state.doc.lineAt(line.from).number;
              const underlineText = view.state.doc.line(lineNumber + 1).slice();

              if (underlineText.indexOf("=") >= 0) {
                settextHeadingLevel = 1;
              } else if (underlineText.indexOf("-") >= 0) {
                settextHeadingLevel = 2;
              }
            } else if (type.name === "SettextUnderlineText") {
              const lineText = view.state.doc.lineAt(line.from).slice();

              if (lineText.indexOf("=") >= 0) {
                settextHeadingLevel = 1;
              } else if (lineText.indexOf("-") >= 0) {
                settextHeadingLevel = 2;
              }
            }
          }
        });

        if (atxHeadingLevel > 0) {
          const decorator = HEADING_LEVEL_DECORATOR.atx[atxHeadingLevel - 1];
          if (decorator) {
            deco.push(decorator.range(line.from));
          }
        } else if (settextHeadingLevel > 0) {
          const decorator =
            HEADING_LEVEL_DECORATOR.settext[settextHeadingLevel - 1];
          if (decorator) {
            deco.push(decorator.range(line.from));
          }
        }
      })(view.state.doc.lines);

      return Decoration.set(sortBy([get("from"), get("to")])(deco));
    }
  }
).decorations();

const inlineStyleTheme = EditorView.baseTheme({
  "md-atx-heading-level-1": { fontSize: "30px", fontWeight: "bold" },
  "md-atx-heading-level-2": { fontSize: "28px", fontWeight: "normal" },
  "md-atx-heading-level-3": { fontSize: "24px", fontWeight: "bold" },
  "md-atx-heading-level-4": { fontSize: "22px", fontWeight: "normal" },
  "md-atx-heading-level-5": { fontSize: "18px", fontWeight: "bold" },
  "md-atx-heading-level-6": { fontSize: "16px", fontWeight: "normal" },
  "md-settext-heading-level-1": { fontSize: "30px", fontWeight: "bold" },
  "md-settext-heading-level-2": { fontSize: "28px", fontWeight: "normal" }
});

export default () => {
  return [inlineStyleTheme, inlineStyleHighlighter];
};
