import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/state";
import { SyntaxNode } from "@lezer/common";

import {
  StateField,
  Extension,
  Transaction,
  EditorState
} from "@codemirror/state";

import { getLineTypeDecoration, getNodeTypeDecoration } from "./decoration";
import { iterateRootNodesInRange } from "./node";

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
  const changedRanges: { before: NumericRange; after: NumericRange }[] = [];

  transaction.changes.iterChangedRanges(
    (beforeStart, beforeEnd, afterStart, afterEnd) => {
      changedRanges.push({
        before: sortedNumericRange(beforeStart, beforeEnd),
        after: sortedNumericRange(afterStart, afterEnd)
      });
    },
    true
  );

  // If there isn't any document changes ...
  if (changedRanges.length <= 0) {
    // ... then use selection ranges as changes to trigger updates.
    transaction.selectionRanges.forEach((selectionRange) => {
      changedRanges.push({
        before: selectionRange,
        after: selectionRange
      });
    });
  }

  const effectiveBeforeRanges: NumericRange[] = [];

  // Before applying changes in the transaction to `decorationSet`, we have
  // to remove any decoration from the `changedRanges.before` range of
  // lines, so we don't end up with duplicated decorations.
  for (let rangeIndex = 0; rangeIndex < changedRanges.length; rangeIndex++) {
    const { before: beforeRange } = changedRanges[rangeIndex];

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
  // decorations for all the `changedRanges.after` ranges and store those
  // decorations in `decorationSet`.
  for (let rangeIndex = 0; rangeIndex < changedRanges.length; rangeIndex++) {
    const { after: afterRange } = changedRanges[rangeIndex];

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
      // TODO: Use `ensureSyntaxTree` to ensure the tree is fully available.
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
    },
    provide: (stateField) => {
      return EditorView.decorations.computeN([stateField], (editorState) =>
        editorState.field(stateField)
      );
    }
  });
};

export default (): Extension[] => [stateField()];
