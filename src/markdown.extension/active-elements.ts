import { StateField, Extension } from "@codemirror/state";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

import { getActiveDecoration } from "/src/markdown.extension/decoration";

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
              getActiveDecoration("line").range(
                transaction.state.doc.line(line).from
              )
            ]
          });

          const cursor = syntaxTree(transaction.state).cursor(range.from);

          if (
            cursor.node.type.name === "Emphasis" ||
            cursor.node.type.name === "StrongEmphasis"
          ) {
            decorationSet = decorationSet.update({
              add: [
                getActiveDecoration("node").range(
                  cursor.node.from,
                  cursor.node.to
                )
              ]
            });
          }
        } else {
          const fromLine = transaction.state.doc.lineAt(range.from).number;
          const toLine = transaction.state.doc.lineAt(range.to).number;

          for (let line = fromLine; line <= toLine; line++) {
            decorationSet = decorationSet.update({
              add: [
                getActiveDecoration("line").range(
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

export default (): Extension[] => [stateField()];
