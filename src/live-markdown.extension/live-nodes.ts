import { StateField, Extension } from "@codemirror/state";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { SyntaxNode } from "@lezer/common";

const ACTIVE_NODE_CLASS_NAME = "hrg-node-Active";

const activeNodeDecoration = Decoration.mark({
  attributes: { class: ACTIVE_NODE_CLASS_NAME }
});

const resolveNode = (node: SyntaxNode): string | null => {
  if (!node) {
    return null;
  } else if (
    node.type.name === "EmphasisMark" ||
    node.type.name === "CodeMark" ||
    node.type.name === "HeaderMark"
  ) {
    return resolveNode(node.parent);
  } else if (
    node.type.name === "Emphasis" ||
    node.type.name === "StrongEmphasis" ||
    node.type.name === "InlineCode" ||
    node.type.name === "CodeText" ||
    node.type.name === "FencedCode" ||
    node.type.name === "ATXHeading1" ||
    node.type.name === "ATXHeading2" ||
    node.type.name === "ATXHeading3" ||
    node.type.name === "ATXHeading4" ||
    node.type.name === "ATXHeading5" ||
    node.type.name === "ATXHeading6" ||
    node.type.name === "SetextHeading1" ||
    node.type.name === "SetextHeading2"
  ) {
    return resolveNode(node.parent) || `${node.from}:${node.to}`;
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
          .map((cursor) => resolveNode(cursor.node))
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

      // TODO: Refactor this to match the multi-layer implementation of the
      //       node decoration extension

      return decorationSet;
    },
    provide: (stateField) => {
      return EditorView.decorations.compute([stateField], (editorState) =>
        editorState.field(stateField)
      );
    }
  });

const DEBUG = true;

const STYLES_INACTIVE = DEBUG ? { opacity: 0.5 } : { display: "none" };

const STYLES_ACTIVE = DEBUG ? { opacity: 1 } : { display: "inline" };

const theme = () =>
  EditorView.baseTheme({
    ".hrg-line-Paragraph": {
      "& .hrg-EmphasisMark": { ...STYLES_INACTIVE },
      "& .hrg-CodeMark": { ...STYLES_INACTIVE },
      [`& .${ACTIVE_NODE_CLASS_NAME}`]: {
        "& .hrg-EmphasisMark": { ...STYLES_ACTIVE },
        "& .hrg-CodeMark": { ...STYLES_ACTIVE }
      }
    },
    ".hrg-line-FencedCode": {
      "& .hrg-CodeMark": { ...STYLES_INACTIVE },
      [`& .${ACTIVE_NODE_CLASS_NAME}`]: {
        "& .hrg-CodeMark": { ...STYLES_ACTIVE }
      }
    },
    ...[1, 2, 3, 4, 5, 6].reduce(
      (acc, level) => ({
        ...acc,
        [`.hrg-line-ATXHeading${level}`]: {
          "& .hrg-HeaderMark": { ...STYLES_INACTIVE },
          "& .hrg-HeaderGap": { ...STYLES_INACTIVE },
          [`& .${ACTIVE_NODE_CLASS_NAME}`]: {
            "& .hrg-HeaderMark": { ...STYLES_ACTIVE },
            "& .hrg-HeaderGap": { ...STYLES_ACTIVE }
          }
        }
      }),
      {}
    ),
    ...[1, 2].reduce(
      (acc, level) => ({
        ...acc,
        [`.hrg-line-SetextHeading${level}`]: {
          "& .hrg-HeaderMark": { ...STYLES_INACTIVE },
          [`& .${ACTIVE_NODE_CLASS_NAME}`]: {
            "& .hrg-HeaderMark": { ...STYLES_ACTIVE }
          }
        }
      }),
      {}
    )
  });

export default (): Extension[] => [stateField(), theme()];
