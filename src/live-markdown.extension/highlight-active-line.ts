import { StateField, Extension } from "@codemirror/state";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";

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

const theme = () =>
  EditorView.baseTheme({
    [`.${ACTIVE_LINE_CLASS_NAME}`]: {
      backgroundColor: "#f0f8ff"
    }
  });

export default (): Extension[] => [stateField(), theme()];
