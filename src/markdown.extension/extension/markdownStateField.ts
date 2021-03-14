import { StateField, Extension, EditorState } from "@codemirror/state";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { SyntaxNode, Tree } from "lezer-tree";
import { ensureSyntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/rangeset";
import { Text } from "@codemirror/text";

import { default as MarkdownProcessor } from "../processor/markdownProcessor";

type NumericRange = { from: number; to: number };

type ChangedLinesRange = { from: NumericRange; to: NumericRange };

const sortedNumericRange = (from: number, to: number) => {
  return from > to ? { from: to, to: from } : { from, to };
};

const logRange = (
  indent: number,
  name: string,
  range: NumericRange,
  doc: Text
) => {
  console.log(
    `${Array(indent).join("  ")}[${name}]`,
    "Lines",
    JSON.stringify([
      doc.lineAt(range.from).number,
      doc.lineAt(range.to).number
    ]),
    "|",
    "Position",
    JSON.stringify([range.from, range.to])
  );
};

const decorateNode = (
  node: SyntaxNode,
  state: EditorState,
  depth = 0
): Range<Decoration>[] => {
  const decorationRanges: Range<Decoration>[] = [];

  if (node.from !== node.to) {
    // logRange(depth, node.type.name, node, state.doc);

    decorationRanges.push(
      Decoration.mark({
        attributes: {
          class: `hrg-${node.type.name}`,
          // "data-range": `${node.from},${node.to}`,
          "data-depth": `${depth}`
        }
      }).range(node.from, node.to)
    );
  }

  const cursor = node.cursor;

  if (cursor.firstChild()) {
    while (true) {
      decorateNode(cursor.node, state, depth + 1).forEach(
        (childDecorationRange) => {
          decorationRanges.push(childDecorationRange);
        }
      );

      if (!cursor.nextSibling()) {
        break;
      }
    }
  }

  return decorationRanges;
};

const waitForSyntaxTree = (
  state: EditorState,
  position: number,
  timeout: number
): Tree => {
  let tree: Tree;

  while (!tree) {
    // The `ensureSyntaxTree` function could return `null` if it's not
    // done processing the tree within the time limit specified. But we
    // still want to wait until it's done so we just keep looping for
    // as long as the returned value is `null`.
    tree = ensureSyntaxTree(state, position, timeout);
  }

  return tree;
};

const iterateRootNodesInRange = (
  state: EditorState,
  range: NumericRange,
  iterator: (node: SyntaxNode) => void
) => {
  // Wait for the syntax tree to be parsed to a point that includes the end
  // position of the given range.
  const tree = waitForSyntaxTree(state, range.to, 5000);

  // Creator a cursor ...
  const cursor = tree.cursor();
  // ... then move it to the start of the range.
  cursor.moveTo(range.from);

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

    if (range.from + cursorOffset <= 0) {
      break;
    }

    cursor.moveTo(range.from + cursorOffset);
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

    if (range.from + cursorOffset > Math.min(range.to, state.doc.length)) {
      break;
    }

    cursor.moveTo(range.from + cursorOffset);
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
      if (cursor.node.from > range.to) {
        break;
      }
    }
  }
};

const markdownElementsStateField = (markdownProcessor: MarkdownProcessor) =>
  StateField.define<DecorationSet[]>({
    create: () => [],
    update: (decorationSets, transaction) => {
      markdownProcessor.testLog();

      if (transaction.docChanged) {
        const oldState = transaction.startState;
        const newState = transaction.state;

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
        // lines so we don't end up with duplicated decorations.
        changedLinesRanges.forEach(({ from: beforeRange }) => {
          logRange(0, "beforeRange", beforeRange, oldState.doc);

          iterateRootNodesInRange(oldState, beforeRange, (node) => {
            decorationSets = decorationSets.map((decorationSet) => {
              const rangeFromLine = oldState.doc.lineAt(node.from);
              const rangeToLine = oldState.doc.lineAt(node.to);

              decorationSet = decorationSet.update({
                filterFrom: rangeFromLine.from,
                filterTo: rangeToLine.to,
                filter: (from, to) => {
                  const decorationFromLine = oldState.doc.lineAt(from);
                  const decorationToLine = oldState.doc.lineAt(to);

                  // Return `true` -- keep -- decorations that are either ended above
                  // the range, or started below the range.
                  // In other words: return `false` -- discard -- decorations that
                  // are in, or partially in the range.
                  return (
                    decorationToLine.number < rangeFromLine.number ||
                    decorationFromLine.number > rangeToLine.number
                  );
                }
              });

              return decorationSet;
            });
          });
        });

        // Apply the changes in the transaction to `decorationSet` so that the
        // position of the decorations in the set would be updated to their new
        // positions.
        decorationSets = decorationSets.map((decorationSet) => {
          return decorationSet.map(transaction.changes);
        });

        // After applying changes in the transaction to `decorationSet`, create
        // decorations for all the `changedLinesRanges.to` ranges and store those
        // decorations in `decorationSet`.
        changedLinesRanges.forEach(({ to: afterRange }) => {
          logRange(0, "afterRange", afterRange, newState.doc);

          iterateRootNodesInRange(newState, afterRange, (node) => {
            decorateNode(node, newState).forEach((decorationRange) => {
              const depth = decorationRange.value.spec.attributes["data-depth"];
              if (!decorationSets[depth]) {
                decorationSets[depth] = Decoration.none;
              }

              decorationSets[depth] = decorationSets[depth].update({
                add: [decorationRange],
                sort: true
              });
            });
          });
        });
      }

      return decorationSets;
    },
    provide: (stateField) => {
      return EditorView.decorations.computeN([stateField], (editorState) =>
        editorState.field(stateField)
      );
    }
  });

const activeLinesStateField = () =>
  StateField.define<DecorationSet>({
    create: () => Decoration.none,
    update: (decorationSet, transaction) => {
      decorationSet = Decoration.none;

      transaction.state.selection.ranges
        .filter((range) => range.empty)
        .reduce((acc, range) => {
          acc.add(transaction.state.doc.lineAt(range.from).number);
          acc.add(transaction.state.doc.lineAt(range.to).number);
          return acc;
        }, new Set<number>())
        .forEach((activeLineNumber) => {
          const activeLine = transaction.state.doc.line(activeLineNumber);
          const tree = waitForSyntaxTree(
            transaction.state,
            activeLine.to,
            5000
          );

          const cursor = tree.cursor();
          cursor.moveTo(activeLine.to, -1);

          while (true) {
            if (
              cursor.node.parent === null ||
              cursor.node.parent.type.name === "Document"
            ) {
              break;
            }

            if (!cursor.parent()) {
              break;
            }
          }

          const fromLine = transaction.state.doc.lineAt(cursor.node.from);
          const toLine = transaction.state.doc.lineAt(cursor.node.to);

          for (
            let lineNumber = fromLine.number;
            lineNumber <= toLine.number;
            lineNumber++
          ) {
            decorationSet = decorationSet.update({
              add: [
                Decoration.line({
                  attributes: { class: `hrg-ActiveLine` }
                }).range(transaction.state.doc.line(lineNumber).from)
              ]
            });
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

export default (markdownProcessor: MarkdownProcessor): Extension[] => [
  markdownElementsStateField(markdownProcessor),
  activeLinesStateField()
];
