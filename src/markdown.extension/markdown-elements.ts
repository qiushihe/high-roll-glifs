import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/rangeset";
import { SyntaxNode } from "@lezer/common";

import {
  StateField,
  Extension,
  Transaction,
  EditorState,
  ChangeSet
} from "@codemirror/state";

import {
  getLineTypeDecoration,
  getNodeTypeDecoration
} from "/src/markdown.extension/decoration";

type NumericRange = { from: number; to: number };

type ChangedLinesRange = { from: NumericRange; to: NumericRange };

type PlainTransaction = {
  oldState: EditorState;
  newState: EditorState;
  changes: ChangeSet;
};

type GraduatedDecorationRange = {
  decorationRange: Range<Decoration>;
  depth: number;
};

const sortedNumericRange = (from: number, to: number) => {
  return from > to ? { from: to, to: from } : { from, to };
};

const decodeTransaction = (transaction: Transaction): PlainTransaction => {
  return {
    oldState: transaction.startState,
    newState: transaction.state,
    changes: transaction.changes
  };
};

const composeTransactions = (
  transactions: PlainTransaction[]
): PlainTransaction => {
  return transactions.reduce((acc, transaction) => {
    if (acc === null) {
      return transaction;
    } else {
      return {
        oldState: acc.oldState,
        newState: transaction.newState,
        changes: acc.changes.compose(transaction.changes)
      };
    }
  }, null);
};

// TODO: Fix the bug where starting text entry on an empty line would cause the
//       decorations on the following block elements to be cleared.
const iterateRootNodesInRange = (
  state: EditorState,
  range: NumericRange,
  iterator: (node: SyntaxNode) => void
) => {
  // Wait for the syntax tree to be parsed to a point that includes the end
  // position of the given range.
  const tree = syntaxTree(state);

  // Normalize the given `range` (which may start and end in the middle of some
  // lines) to "block range" that always starts and ends at the start/end of
  // their respective lines.
  const blockRange = {
    from: state.doc.lineAt(range.from).from,
    to: state.doc.lineAt(range.to).to
  };

  // Creator a cursor ...
  const cursor = tree.cursor();
  // ... then move it to the start of the range.
  cursor.moveTo(blockRange.from);

  // Before processing, we have to ensure the cursor is pointing to a top level
  // block element. This means we can't have to cursor pointing to the root
  // Document; nor can we have the cursor pointing to some inline elements.
  let cursorOffset = 0;

  // First nudge the cursor backward from its starting location until we either
  // reached the beginning of the document, or until we reached something
  // that's not a "Document" node.
  while (true) {
    if (cursor.node.type.name !== "Document") {
      break;
    }

    cursorOffset += -1;

    if (blockRange.from + cursorOffset <= 0) {
      break;
    }

    cursor.moveTo(blockRange.from - cursorOffset);
  }

  // Reset cursor offset in case we have to nudge the cursor in the other
  // direction later.
  cursorOffset = 0;

  // Nudge the cursor forward, only if after all the backward nudging, we're
  // still on a "Document" node.
  while (true) {
    if (cursor.node.type.name !== "Document") {
      break;
    }

    cursorOffset += 1;

    if (
      blockRange.from + cursorOffset >
      Math.min(blockRange.to, state.doc.length)
    ) {
      break;
    }

    cursor.moveTo(blockRange.from + cursorOffset);
  }

  // Finally, continue to "go up" with the cursor until the cursor is pointing
  // at a top-level element.
  while (true) {
    if (!cursor.node.parent || cursor.node.parent.type.name === "Document") {
      break;
    }
    cursor.parent();
  }

  // Only continue processing if after all the nudging, we finally ended up on
  // something that's not a "Document" node.
  if (cursor.node.type.name !== "Document") {
    while (true) {
      iterator(cursor.node);

      // Stop processing if there is nothing left.
      if (!cursor.nextSibling()) {
        break;
      }

      // Also stop processing if we reached the end of the range.
      if (cursor.node.from > blockRange.to) {
        break;
      }
    }
  }
};

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

  const cursor = node.cursor;

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
): DecorationSet[] => {
  const oldState = transaction.oldState;
  const newState = transaction.newState;

  // Used to keep track of the range of lines affected by the transaction.
  const changedLinesRanges: ChangedLinesRange[] = [];

  transaction.changes.iterChangedRanges(
    (beforeStart, beforeEnd, afterStart, afterEnd) => {
      changedLinesRanges.push({
        from: sortedNumericRange(beforeStart, beforeEnd),
        to: sortedNumericRange(afterStart, afterEnd)
      });
    },
    true
  );

  // Before applying changes in the transaction to `decorationSet`, we have
  // to remove any decoration from the `changedLinesRanges.from` range of
  // lines, so we don't end up with duplicated decorations.
  for (
    let rangeIndex = 0;
    rangeIndex < changedLinesRanges.length;
    rangeIndex++
  ) {
    const { from: beforeRange } = changedLinesRanges[rangeIndex];

    iterateRootNodesInRange(oldState, beforeRange, (node) => {
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
    });
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

    // Since all decorations for the affected ranges were removed at the start,
    // we now have to redecorate the root level block elements.
    // Use layer `0` for line level block type decorations.
    if (!decorationSets[0]) {
      decorationSets[0] = Decoration.none;
    }
    const newDecorations: Range<Decoration>[] = [];
    iterateRootNodesInRange(newState, afterRange, (node) => {
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
      decorationSets[0] = decorationSets[0].update({
        add: newDecorations
      });
    }

    // Update decorations for markdown elements.
    iterateRootNodesInRange(newState, afterRange, (node) => {
      // Use layer `1` and onward for element type decorations.
      decorateNode(node, newState, 1).forEach(({ decorationRange, depth }) => {
        if (!decorationSets[depth]) {
          decorationSets[depth] = Decoration.none;
        }

        decorationSets[depth] = decorationSets[depth].update({
          add: [decorationRange],
          sort: true
        });
      });
    });
  }

  // Reverse the decoration set before the innermost layer (which has the
  // highest depth) needs to be applied first.
  return decorationSets.reverse();
};

const stateField = () => {
  let pendingTransactions: Transaction[] = [];

  return StateField.define<DecorationSet[]>({
    create: () => [],
    update: (decorationSets, transaction) => {
      const tree = syntaxTree(transaction.state);

      // TODO: Maybe this part needs some updates/comments:
      //       * Why use `>=` when comparing `tree.length` and `transaction.state.doc.length`?
      //       * Why not check pending transaction first?

      if (transaction.docChanged) {
        // If the raw document that's being loaded is very large, then the doc
        // length would be smaller than the tree length. And in that case we
        // queue the transaction to wait until the doc catches up with the tree
        // before processing.
        if (tree.length >= transaction.state.doc.length) {
          decorationSets = updateDecorations(
            decorationSets,
            decodeTransaction(transaction)
          );
          return decorationSets;
        } else {
          pendingTransactions.push(transaction);
          return decorationSets;
        }
      } else if (
        pendingTransactions.length > 0 &&
        tree.length >= transaction.state.doc.length
      ) {
        decorationSets = updateDecorations(
          decorationSets,
          composeTransactions([
            ...pendingTransactions.map(decodeTransaction),
            decodeTransaction(transaction)
          ])
        );
        pendingTransactions = [];
        return decorationSets;
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
