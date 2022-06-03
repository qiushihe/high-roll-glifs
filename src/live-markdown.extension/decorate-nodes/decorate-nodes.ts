import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/state";
import { SyntaxNode, Tree } from "@lezer/common";

import {
  StateField,
  Extension,
  Transaction,
  EditorState
} from "@codemirror/state";

import { getLineTypeDecoration, getNodeTypeDecoration } from "./decoration";

import {
  PlainTransaction,
  decodeTransaction,
  composeTransactions
} from "./transaction";

import {
  NumericRange,
  GraduatedDecorationRange,
  sortedNumericRange
} from "./range";

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
const iterateRootNodesInRange = (
  state: EditorState,
  range: NumericRange,
  iterator: (node: SyntaxNode) => void
): NumericRange => {
  // Get syntax tree.
  // TODO: Use `ensureSyntaxTree` to ensure the tree is fully available.
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

// Apply decoration to a given node as well as all of its child nodes.
const decorateNode = (
  node: SyntaxNode,
  state: EditorState,
  depth = 0
): GraduatedDecorationRange[] => {
  const ranges: GraduatedDecorationRange[] = [];

  if (node.from !== node.to) {
    ranges.push({
      decorationRange: getNodeTypeDecoration(node.type.name).range(
        node.from,
        node.to
      ),
      depth
    });
  }

  const cursor = node.cursor();

  if (cursor.firstChild()) {
    while (true) {
      decorateNode(cursor.node, state, depth + 1).forEach(
        (childDecorationRange) => {
          ranges.push(childDecorationRange);
        }
      );

      if (!cursor.nextSibling()) {
        break;
      }
    }
  }

  return ranges;
};

const updateDecorations = (
  decorationSets: DecorationSet[],
  transaction: PlainTransaction
) => {
  const oldState = transaction.oldState;
  const newState = transaction.newState;

  // Used to keep track of the range of lines affected by the transaction.
  const changedLinesRanges: { from: NumericRange; to: NumericRange }[] = [];

  transaction.changes.iterChangedRanges(
    (beforeStart, beforeEnd, afterStart, afterEnd) => {
      changedLinesRanges.push({
        from: sortedNumericRange(beforeStart, beforeEnd),
        to: sortedNumericRange(afterStart, afterEnd)
      });
    },
    true
  );

  const effectiveBeforeRanges: NumericRange[] = [];

  // Before applying changes in the transaction to `decorationSet`, we have
  // to remove any decoration from the `changedLinesRanges.from` range of
  // lines, so we don't end up with duplicated decorations.
  for (
    let rangeIndex = 0;
    rangeIndex < changedLinesRanges.length;
    rangeIndex++
  ) {
    const { from: beforeRange } = changedLinesRanges[rangeIndex];

    effectiveBeforeRanges[rangeIndex] = iterateRootNodesInRange(
      oldState,
      beforeRange,
      (node) => {
        const fromLine = oldState.doc.lineAt(node.from);
        const toLine = oldState.doc.lineAt(node.to);

        decorationSets = decorationSets.map((decorationSet) => {
          decorationSet = decorationSet.update({
            filterFrom: fromLine.from,
            filterTo: toLine.to,
            filter: () => false
          });

          return decorationSet;
        });
      }
    );
  }

  // Apply the changes in the transaction to `decorationSet` so that the
  // position of the decorations in the set would be updated to their new
  // positions.
  decorationSets = decorationSets.map((decorationSet) => {
    return decorationSet.map(transaction.changes);
  });

  // After applying changes in the transaction to `decorationSet`, create
  // decorations for all the `changedLinesRanges.to` ranges and store those
  // decorations in `decorationSet`.
  for (
    let rangeIndex = 0;
    rangeIndex < changedLinesRanges.length;
    rangeIndex++
  ) {
    const { to: afterRange } = changedLinesRanges[rangeIndex];

    // Since during the course of removing decorations from affected ranges,
    // we likely would have removed decorations from a larger range from the
    // original range. Here we have to compensate the "after range" so that it
    // is extended to cover at least the same area as the range from which
    // decorations were removed from.
    const effectiveAfterRange = {
      from: Math.min(afterRange.from, effectiveBeforeRanges[rangeIndex].from),
      to: Math.max(
        afterRange.to,
        effectiveBeforeRanges[rangeIndex].to +
          (newState.doc.length - oldState.doc.length)
      )
    };

    // Since all decorations for the affected ranges were removed at the start,
    // we now have to redecorate the root level block elements.
    // Use layer `0` for line level block type decorations.
    const newDecorations: Range<Decoration>[] = [];

    iterateRootNodesInRange(newState, effectiveAfterRange, (node) => {
      const blockType = node.type.name;
      const fromLine = newState.doc.lineAt(node.from);
      const toLine = newState.doc.lineAt(node.to);

      for (let curLine = fromLine.number; curLine <= toLine.number; curLine++) {
        newDecorations.push(
          getLineTypeDecoration(blockType).range(
            transaction.newState.doc.line(curLine).from
          )
        );
      }
    });
    if (newDecorations.length > 0) {
      decorationSets[0] = (decorationSets[0] || Decoration.none).update({
        add: newDecorations,
        sort: true
      });
    }

    // Update decorations for inline markdown elements.
    iterateRootNodesInRange(newState, effectiveAfterRange, (node) => {
      // Use layer `1` and onward for element type decorations.
      decorateNode(node, newState, 1).forEach(({ decorationRange, depth }) => {
        decorationSets[depth] = (
          decorationSets[depth] || Decoration.none
        ).update({
          add: [decorationRange],
          sort: true
        });
      });
    });
  }

  // Reverse the decoration set because the innermost layer (which has the
  // highest depth) needs to be applied first.
  return decorationSets.reverse();
};

const stateField = () => {
  let pendingTransactions: Transaction[] = [];

  return StateField.define<DecorationSet[]>({
    create: () => [],
    update: (decorationSets, transaction) => {
      if (transaction.docChanged) {
        const tree = syntaxTree(transaction.state);

        // If the raw document that's being loaded is very large, then the doc
        // length would be smaller than the tree length. And in that case we
        // queue the transaction to wait until the doc catches up with the tree
        // before processing.
        if (tree.length >= transaction.state.doc.length) {
          if (pendingTransactions.length > 0) {
            decorationSets = updateDecorations(
              decorationSets,
              composeTransactions([
                ...pendingTransactions.map(decodeTransaction),
                decodeTransaction(transaction)
              ])
            );
            pendingTransactions = [];
          } else {
            decorationSets = updateDecorations(
              decorationSets,
              decodeTransaction(transaction)
            );
          }
          return decorationSets;
        } else {
          pendingTransactions.push(transaction);
          return decorationSets;
        }
      } else {
        return decorationSets;
      }
    },
    provide: (stateField) => {
      return EditorView.decorations.computeN([stateField], (editorState) =>
        editorState.field(stateField)
      );
    }
  });
};

export default (): Extension[] => [stateField()];
