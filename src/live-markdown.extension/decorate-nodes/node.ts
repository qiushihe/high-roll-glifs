import { syntaxTree } from "@codemirror/language";
import { SyntaxNode, Tree } from "@lezer/common";
import { EditorState } from "@codemirror/state";

import { NumericRange } from "./range";

// Return the range covered by root level nodes touched by the given range.
const getRootNodeRange = (tree: Tree, range: NumericRange): NumericRange => {
  const cursor = tree.cursor();

  // Move cursor to the start of the range.
  cursor.moveTo(range.from, 1);

  // If the cursor is currently on a "Document" node ...
  if (cursor.node.type.name === "Document") {
    // Offset the start position until we get to a node that's not a "Document"
    // node, or until we run out of documents.
    let fromOffset = 0;
    while (true) {
      if (range.from + fromOffset < 0) {
        break;
      }

      if (cursor.node.type.name !== "Document") {
        break;
      }

      fromOffset = fromOffset - 1;
      cursor.moveTo(range.from + fromOffset, 1);
    }

    const cursorFrom = cursor.from;

    // Next move the cursor to the end of the range.
    cursor.moveTo(range.to, -1);

    // If the cursor is currently on a "Document" node ...
    if (cursor.node.type.name === "Document") {
      // Offset the end position until we get to a node that's not a "Document"
      // node, or until we run out of documents.
      let toOffset = 0;
      while (true) {
        if (range.from + toOffset > tree.length) {
          break;
        }

        if (cursor.node.type.name !== "Document") {
          break;
        }

        toOffset = toOffset + 1;
        cursor.moveTo(range.to + toOffset, -1);
      }

      // Now we can return start and end positions which point to the start/end
      // of root level, non-Document nodes.
      return { from: cursorFrom, to: cursor.to };
    }
    // If the cursor is currently not on a "Document" node ...
    else {
      // ... then move the cursor "up" until its current node's parent is a
      // "Document" node.
      while (true) {
        if (
          !cursor.node.parent ||
          cursor.node.parent.type.name === "Document"
        ) {
          break;
        }
        cursor.parent();
      }

      // Now we can return start and end positions which point to the start/end
      // of root level, non-Document nodes.
      return { from: range.from, to: cursor.to };
    }
  }
  // If the cursor is currently not on a "Document" node ...
  else {
    // ... then move the cursor "up" until its current node's parent is a
    // "Document" node.
    while (true) {
      if (!cursor.node.parent || cursor.node.parent.type.name === "Document") {
        break;
      }
      cursor.parent();
    }

    const cursorFrom = cursor.from;

    // Next move the cursor to the end of the range.
    cursor.moveTo(range.to, -1);

    // If the cursor is currently on a "Document" node ...
    if (cursor.node.type.name === "Document") {
      // ... then return the start position plus the unmodified end position.
      return { from: cursorFrom, to: range.to };
    }
    // If the cursor is currently not on a "Document" node ...
    else {
      // ... then move the cursor "up" until its current node's parent is a
      // "Document" node.
      while (true) {
        if (
          !cursor.node.parent ||
          cursor.node.parent.type.name === "Document"
        ) {
          break;
        }
        cursor.parent();
      }

      // Now we can return start and end positions which point to the start/end
      // of root level, non-Document nodes.
      return { from: cursorFrom, to: cursor.to };
    }
  }
};

// Iterate all root-level nodes within the given range.
export const iterateRootNodesInRange = (
  state: EditorState,
  range: NumericRange,
  iterator: (node: SyntaxNode) => void
): NumericRange => {
  // Get syntax tree.
  const tree = syntaxTree(state);

  // Get root-level node range touched by the given range.
  const { from: rootNodeRangeFrom, to: rootNodeRangeTo } = getRootNodeRange(
    tree,
    {
      from: state.doc.lineAt(range.from).from,
      to: state.doc.lineAt(range.to).to
    }
  );

  // Convert root-level node range to line ranges because whenever we're
  // clearing or (re)decorating nodes, we either want to ignore a line
  // completely, or process all the nodes on that line.
  const { from: rootBlockRangeFrom, to: rootBlockRangeTo } = {
    from: state.doc.lineAt(rootNodeRangeFrom).from,
    to: state.doc.lineAt(rootNodeRangeTo).to
  };

  tree.iterate({
    enter: (syntaxNode) => {
      if (
        syntaxNode.type.name !== "Document" &&
        (!syntaxNode.node.parent ||
          syntaxNode.node.parent.type.name === "Document")
      ) {
        iterator(syntaxNode.node);
      }
    },
    from: rootBlockRangeFrom,
    to: rootBlockRangeTo
  });

  // Since the given range to this function can be different from the effective
  // range processed by this function, we return the effective range.
  return { from: rootBlockRangeFrom, to: rootBlockRangeTo };
};
