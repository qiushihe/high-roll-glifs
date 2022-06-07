import { StateField, Extension } from "@codemirror/state";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";

import { PresentationOptions } from "./presentation";

const ACTIVE_LINE_CLASS_NAME = "hrg-ActiveLine";

const activeLineDecoration = Decoration.line({
  attributes: { class: ACTIVE_LINE_CLASS_NAME }
});

const stateField = () =>
  StateField.define<DecorationSet>({
    create: () => Decoration.none,
    update: (decorationSet, transaction) => {
      decorationSet = Decoration.none;

      transaction.state.selection.ranges.forEach((range) => {
        if (range.from === range.to) {
          const line = transaction.state.doc.lineAt(range.from).number;

          decorationSet = decorationSet.update({
            add: [
              activeLineDecoration.range(transaction.state.doc.line(line).from)
            ]
          });
        } else {
          const fromLine = transaction.state.doc.lineAt(range.from).number;
          const toLine = transaction.state.doc.lineAt(range.to).number;

          for (let line = fromLine; line <= toLine; line++) {
            decorationSet = decorationSet.update({
              add: [
                activeLineDecoration.range(
                  transaction.state.doc.line(line).from
                )
              ]
            });
          }
        }
      });

      return decorationSet;
    },
    provide: (stateField) => {
      return EditorView.decorations.compute([stateField], (editorState) =>
        editorState.field(stateField)
      );
    }
  });

type ThemeConfig = {
  presentation: PresentationOptions;
};

const theme = (config: ThemeConfig) =>
  EditorView.baseTheme({
    [`.${ACTIVE_LINE_CLASS_NAME}`]: {
      backgroundColor: config.presentation.activeLineBackgroundColor
    }
  });

type ExtensionConfig = ThemeConfig;

export default (config: ExtensionConfig): Extension[] => [
  stateField(),
  theme({ presentation: config.presentation })
];
