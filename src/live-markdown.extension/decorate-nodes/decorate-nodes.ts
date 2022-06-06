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

type FieldValue = {
  decorationSets: DecorationSet[];
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

    // TODO: Refactor these to be injectable into this function in a more
    //       formal manner
    if (node.type.name === "HeaderMark") {
      if (node.parent?.type.name.match(/^ATXHeading/)) {
        const gapMatch = state.doc
          .sliceString(node.parent.from, node.parent.to)
          .match(/^#+(\s+)/);

        ranges.push({
          decorationRange: getNodeTypeDecoration("HeaderGap").range(
            node.to,
            node.to + gapMatch[1].length
          ),
          depth
        });
      }
    }
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
  previousFieldValue: FieldValue,
  transaction: PlainTransaction
) => {
  const oldState = transaction.oldState;
  const newState = transaction.newState;

  let decorationSets: DecorationSet[] = previousFieldValue.decorationSets;

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

  const effectiveBeforeRanges: NumericRange[] = [];

  // Before applying changes in the transaction to `decorationSet`, we have
  // to remove any decoration from the `changedRanges.before` range of
  // lines, so we don't end up with duplicated decorations.
  const beforeRanges = changedRanges.map((changedRange) => changedRange.before);
  // TODO: Implement range merging utility function that can merge segments of
  //       continuous/overlapping ranges.
  // TODO: Merge in selection/extra ranges from previous cycle.
  beforeRanges.forEach((beforeRange, index) => {
    effectiveBeforeRanges[index] = iterateRootNodesInRange(
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
  });

  // Apply the changes in the transaction to `decorationSet` so that the
  // position of the decorations in the set would be updated to their new
  // positions.
  decorationSets = decorationSets.map((decorationSet) => {
    return decorationSet.map(transaction.changes);
  });

  // After applying changes in the transaction to `decorationSet`, create
  // decorations for all the `changedRanges.after` ranges and store those
  // decorations in `decorationSet`.
  const afterRanges = changedRanges.map((changedRange) => changedRange.after);
  // TODO: Implement range merging utility function that can merge segments of
  //       continuous/overlapping ranges.
  // TODO: Merge in selection/extra ranges from transaction's selection.
  // TODO: Return selection's effective active node ranges as "extra ranges".
  afterRanges.forEach((afterRange, index) => {
    // Since during the course of removing decorations from affected ranges,
    // we likely would have removed decorations from a larger range from the
    // original range. Here we have to compensate the "after range" so that it
    // is extended to cover at least the same area as the range from which
    // decorations were removed from.
    const effectiveAfterRange = {
      from: Math.min(afterRange.from, effectiveBeforeRanges[index].from),
      to: Math.max(
        afterRange.to,
        effectiveBeforeRanges[index].to +
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
  });

  // Reverse the decoration set because the innermost layer (which has the
  // highest depth) needs to be applied first.
  return { decorationSets: decorationSets.reverse() };
};

const stateField = () => {
  let pendingTransactions: Transaction[] = [];

  return StateField.define<FieldValue>({
    create: () => ({ decorationSets: [] }),
    update: (fieldValue, transaction) => {
      // TODO: Use `ensureSyntaxTree` to ensure the tree is fully available.
      const tree = syntaxTree(transaction.state);

      // If the raw document that's being loaded is very large, then the doc
      // length would be smaller than the tree length. And in that case we
      // queue the transaction to wait until the doc catches up with the tree
      // before processing.
      if (tree.length >= transaction.state.doc.length) {
        const updated = updateDecorations(
          fieldValue,
          composeTransactions([
            ...pendingTransactions.map(decodeTransaction),
            decodeTransaction(transaction)
          ])
        );

        // Ensure pending transactions (if any) are cleared after they've been
        // composed above.
        pendingTransactions = [];

        // Apply changes to the field value.
        fieldValue.decorationSets = updated.decorationSets;

        return { ...fieldValue };
      } else {
        pendingTransactions.push(transaction);
        return { ...fieldValue };
      }
    },
    provide: (stateField) => {
      return EditorView.decorations.computeN(
        [stateField],
        (editorState) => editorState.field(stateField).decorationSets
      );
    }
  });
};

export default (): Extension[] => [stateField()];
