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

import { iterateRootNodesInRange } from "./node";

import {
  getLineTypeDecoration,
  getNodeTypeDecoration,
  ACTIVE_NODE_TYPE_NAMES,
  nodeDecorator,
  linkDecorator
} from "./decoration";

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
  decorationSets: Record<string, DecorationSet>;
  activeRanges: NumericRange[];
};

const isNodeInRanges = (node: SyntaxNode, ranges: NumericRange[]): boolean => {
  let inRange = false;

  ranges.find((range) => {
    if (range.from <= node.to) {
      if (range.from >= node.from) {
        inRange = true;
      } else {
        if (range.to >= node.from) {
          inRange = true;
        } else {
          inRange = false;
        }
      }
    } else {
      inRange = false;
    }

    if (inRange) {
      return true;
    }
  });

  return inRange;
};

const findChildNodeByType = (
  parent: SyntaxNode,
  childNodeType: string
): SyntaxNode | null => {
  const cursor = parent.cursor();

  if (!cursor.firstChild()) {
    return null;
  }

  let childNode: SyntaxNode | null = null;

  while (true) {
    if (cursor.node.type.name === childNodeType) {
      childNode = cursor.node;
      break;
    }

    if (!cursor.nextSibling()) {
      break;
    }
  }

  return childNode;
};

const getNodeText = (node: SyntaxNode, state: EditorState): string => {
  if (node) {
    return state.doc.sliceString(node.from, node.to) || "";
  } else {
    return "";
  }
};

// Apply decoration to a given node as well as all of its child nodes.
const decorateNode = (
  depth = 0,
  state: EditorState,
  node: SyntaxNode,
  selectionRanges: NumericRange[],
  decoratedRanges: Record<string, string[]>
): GraduatedDecorationRange[] => {
  const ranges: GraduatedDecorationRange[] = [];

  if (node.from !== node.to) {
    const nodeRangeKey = `${node.from}:${node.to}`;
    decoratedRanges[nodeRangeKey] = decoratedRanges[nodeRangeKey] || [];

    if (!decoratedRanges[nodeRangeKey].includes(node.type.name)) {
      const isActive =
        isNodeInRanges(node, selectionRanges) &&
        ACTIVE_NODE_TYPE_NAMES.includes(node.type.name);

      let decoration: Decoration;

      // TODO: Refactor these to be injectable into this function in a more
      //       formal manner
      if (node.type.name === "Link") {
        decoration = getNodeTypeDecoration(node.type.name, linkDecorator, {
          isActive,
          href: getNodeText(findChildNodeByType(node, "URL"), state)
        });
      } else {
        decoration = getNodeTypeDecoration(node.type.name, nodeDecorator, {
          isActive
        });
      }

      ranges.push({
        decorationRange: decoration.range(node.from, node.to),
        depth
      });

      decoratedRanges[nodeRangeKey].push(node.type.name);
    }

    // TODO: Refactor these to be injectable into this function in a more
    //       formal manner
    if (node.type.name === "HeaderMark") {
      if (node.parent?.type.name.match(/^ATXHeading/)) {
        const gapMatch = state.doc
          .sliceString(node.parent.from, node.parent.to)
          .match(/^#+(\s+)/);

        const gapRangeKey = `${node.to}:${node.to + gapMatch[1].length}`;
        decoratedRanges[gapRangeKey] = decoratedRanges[gapRangeKey] || [];

        if (!decoratedRanges[gapRangeKey].includes("HeaderGap")) {
          ranges.push({
            decorationRange: getNodeTypeDecoration("HeaderGap", nodeDecorator, {
              isActive: false
            }).range(node.to, node.to + gapMatch[1].length),
            depth
          });
          decoratedRanges[gapRangeKey].push("HeaderGap");
        }
      }
    }
  }

  const cursor = node.cursor();

  if (cursor.firstChild()) {
    while (true) {
      decorateNode(
        depth + 1,
        state,
        cursor.node,
        selectionRanges,
        decoratedRanges
      ).forEach((childDecorationRange) => {
        ranges.push(childDecorationRange);
      });

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
  let decorationSets = previousFieldValue.decorationSets;
  const activeRanges = previousFieldValue.activeRanges;

  const oldState = transaction.oldState;
  const newState = transaction.newState;
  const selectionRanges = transaction.selectionRanges;

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

  if (changedRanges.length <= 0) {
    selectionRanges.forEach((selectionRange) => {
      if (
        selectionRange.to <= oldState.doc.length &&
        selectionRange.to <= newState.doc.length
      ) {
        changedRanges.push({
          before: sortedNumericRange(selectionRange.from, selectionRange.to),
          after: sortedNumericRange(selectionRange.from, selectionRange.to)
        });
      }
    });
  }

  activeRanges.forEach((activeRange) => {
    if (
      activeRange.to <= oldState.doc.length &&
      activeRange.to <= newState.doc.length
    ) {
      changedRanges.push({
        before: sortedNumericRange(activeRange.from, activeRange.to),
        after: sortedNumericRange(activeRange.from, activeRange.to)
      });
    }
  });

  const effectiveBeforeRanges: NumericRange[] = [];

  // Before applying changes in the transaction to `decorationSet`, we have
  // to remove any decoration from the `changedRanges.before` range of
  // lines, so we don't end up with duplicated decorations.
  changedRanges
    .map((changedRange) => changedRange.before)
    .forEach((beforeRange, index) => {
      effectiveBeforeRanges[index] = iterateRootNodesInRange(
        oldState,
        beforeRange,
        (node) => {
          const fromLine = oldState.doc.lineAt(node.from);
          const toLine = oldState.doc.lineAt(node.to);

          decorationSets = Object.keys(decorationSets).reduce(
            (acc, depthKey) => {
              return {
                ...acc,
                [depthKey]: decorationSets[depthKey].update({
                  filterFrom: fromLine.from,
                  filterTo: toLine.to,
                  filter: () => false
                })
              };
            },
            {} as Record<string, DecorationSet>
          );
        }
      );
    });

  // Apply the changes in the transaction to `decorationSet` so that the
  // position of the decorations in the set would be updated to their new
  // positions.
  decorationSets = Object.keys(decorationSets).reduce((acc, depthKey) => {
    return {
      ...acc,
      [depthKey]: decorationSets[depthKey].map(transaction.changes)
    };
  }, {} as Record<string, DecorationSet>);

  // Since sometimes active/selection range can cause the same node to be
  // traversed more than once, we use a dictionary to keep track of ranges that
  // are already decorated to avoid this.
  const decoratedRanges: Record<string, string[]> = {};

  // After applying changes in the transaction to `decorationSet`, create
  // decorations for all the `changedRanges.after` ranges and store those
  // decorations in `decorationSet`.
  changedRanges
    .map((changedRange) => changedRange.after)
    .map((afterRange, index) => {
      // Since during the course of removing decorations from affected ranges,
      // we likely would have removed decorations from a larger range from the
      // original range. Here we have to compensate the "after range" so that it
      // is extended to cover at least the same area as the range from which
      // decorations were removed from.
      return {
        from: Math.min(afterRange.from, effectiveBeforeRanges[index].from),
        to: Math.max(
          afterRange.to,
          effectiveBeforeRanges[index].to +
            (newState.doc.length - oldState.doc.length)
        )
      } as NumericRange;
    })
    .forEach((afterRange) => {
      // Since all decorations for the affected ranges were removed at the start,
      // we now have to redecorate the root level block elements.
      // Use layer `0` for line level block type decorations.
      const newDecorations: Range<Decoration>[] = [];

      iterateRootNodesInRange(newState, afterRange, (node) => {
        const blockType = node.type.name;
        const fromLine = newState.doc.lineAt(node.from);
        const toLine = newState.doc.lineAt(node.to);

        for (
          let curLine = fromLine.number;
          curLine <= toLine.number;
          curLine++
        ) {
          newDecorations.push(
            getLineTypeDecoration(blockType).range(
              transaction.newState.doc.line(curLine).from
            )
          );
        }
      });
      if (newDecorations.length > 0) {
        decorationSets["0"] = (decorationSets["0"] || Decoration.none).update({
          add: newDecorations,
          sort: true
        });
      }

      // Update decorations for inline markdown elements.
      iterateRootNodesInRange(newState, afterRange, (node) => {
        // Use layer `1` and onward for element type decorations.
        decorateNode(
          1,
          newState,
          node,
          selectionRanges,
          decoratedRanges
        ).forEach(({ decorationRange, depth }) => {
          decorationSets[`${depth}`] = (
            decorationSets[`${depth}`] || Decoration.none
          ).update({
            add: [decorationRange],
            sort: true
          });
        });
      });
    });

  return {
    decorationSets: decorationSets,
    activeRanges: selectionRanges
  };
};

const stateField = () => {
  let pendingTransactions: Transaction[] = [];

  return StateField.define<FieldValue>({
    create: () => ({
      decorationSets: {},
      activeRanges: []
    }),
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
        fieldValue.activeRanges = updated.activeRanges;

        return { ...fieldValue };
      } else {
        pendingTransactions.push(transaction);
        return { ...fieldValue };
      }
    },
    provide: (stateField) => {
      return EditorView.decorations.computeN([stateField], (editorState) => {
        const decorationSets = editorState.field(stateField).decorationSets;
        const depthKeys = Object.keys(decorationSets);

        // Sort the depths so all the layers are in order.
        depthKeys.sort();

        // Reverse the decoration set because the innermost layer (which has
        // the highest depth) needs to be applied first.
        return depthKeys.map((depthKey) => decorationSets[depthKey]).reverse();
      });
    }
  });
};

export default (): Extension[] => [stateField()];
