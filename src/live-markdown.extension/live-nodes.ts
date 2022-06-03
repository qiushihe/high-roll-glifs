import { StateField, Extension } from "@codemirror/state";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

const ACTIVE_NODE_CLASS_NAME = "hrg-node-Active";

const activeNodeDecoration = Decoration.mark({
  attributes: { class: ACTIVE_NODE_CLASS_NAME }
});

const stateField = () =>
  StateField.define<DecorationSet>({
    create: () => Decoration.none,
    update: (decorationSet, transaction) => {
      decorationSet = Decoration.none;

      transaction.state.selection.ranges.forEach((range) => {
        if (range.from === range.to) {
          // TODO: This part needs to work whenever the cursor touches the mark
          //       of the node.
          const cursor = syntaxTree(transaction.state)
            .cursor()
            .moveTo(range.from);
          if (
            cursor.node.type.name === "Emphasis" ||
            cursor.node.type.name === "StrongEmphasis"
          ) {
            decorationSet = decorationSet.update({
              add: [
                activeNodeDecoration.range(cursor.node.from, cursor.node.to)
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
    ".hrg-EmphasisMark": {
      display: "none"
    },
    [`.${ACTIVE_NODE_CLASS_NAME}`]: {
      display: "inline-block",
      "& .hrg-EmphasisMark": {
        display: "inline"
      }
    }
  });

export default (): Extension[] => [stateField(), theme()];
