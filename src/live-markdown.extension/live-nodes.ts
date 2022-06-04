import { StateField, Extension } from "@codemirror/state";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { SyntaxNode } from "@lezer/common";

const ACTIVE_NODE_CLASS_NAME = "hrg-node-Active";

const activeNodeDecoration = Decoration.mark({
  attributes: { class: ACTIVE_NODE_CLASS_NAME }
});

const resolveLiveNodeRange = (node: SyntaxNode): string | null => {
  if (!node) {
    return null;
  } else if (
    node.type.name === "EmphasisMark" ||
    node.type.name === "CodeMark"
  ) {
    return resolveLiveNodeRange(node.parent);
  } else if (
    node.type.name === "Emphasis" ||
    node.type.name === "StrongEmphasis" ||
    node.type.name === "InlineCode"
  ) {
    return resolveLiveNodeRange(node.parent) || `${node.from}:${node.to}`;
  } else {
    return null;
  }
};

const stateField = () =>
  StateField.define<DecorationSet>({
    create: () => Decoration.none,
    update: (decorationSet, transaction) => {
      decorationSet = Decoration.none;

      const tree = syntaxTree(transaction.state);

      transaction.state.selection.ranges.forEach((range) => {
        // Check both the start and end of the selection range.
        [range.from, range.to]
          // Remove duplicate position values (i.e. when the selection is not
          // of a range but only a single point).
          .filter((value, index, array) => array.indexOf(value) === index)
          .map((pos) => {
            // Because a cursor exists between characters, we have to use both
            // the "enter start" and "enter end" format of `moveTo` to check both
            // directions for if the cursor "just about touches" a node or not.
            return [
              tree.cursor().moveTo(pos, 1),
              tree.cursor().moveTo(pos, -1)
            ];
          })
          .flat()
          // For each cursor, resolve the top most level live node range
          .map((cursor) => resolveLiveNodeRange(cursor.node))
          // Remove nil values
          .filter((value) => value !== undefined && value !== null)
          // Remove duplicates (i.e. when the cursor is inside a node, then
          // both the "enter start" and "enter end" cursor will report the
          // same range value).
          .filter((value, index, array) => array.indexOf(value) === index)
          // For each found live node range ...
          .forEach((rangeString) => {
            // ... parse the string values into numeric values ...
            const [from, to] = rangeString
              .split(":")
              .map((value) => parseInt(value));

            // ... then apply live node decoration over the range.
            decorationSet = decorationSet.update({
              add: [activeNodeDecoration.range(from, to)]
            });
          });
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
    ".hrg-line-Paragraph": {
      "& .hrg-EmphasisMark": {
        display: "none"
        // opacity: 0.5
      },
      "& .hrg-CodeMark": {
        display: "none"
        // opacity: 0.5
      },
      [`& .${ACTIVE_NODE_CLASS_NAME}`]: {
        display: "inline-block",
        "& .hrg-EmphasisMark": {
          display: "inline"
          // opacity: 1
        },
        "& .hrg-CodeMark": {
          display: "inline"
          // opacity: 1
        }
      }
    }
  });

export default (): Extension[] => [stateField(), theme()];
