import { ChangeSet, EditorState, Transaction } from "@codemirror/state";

import { NumericRange } from "./range";

export type PlainTransaction = {
  oldState: EditorState;
  newState: EditorState;
  changes: ChangeSet;
  selectionRanges: NumericRange[];
};

export const decodeTransaction = (
  transaction: Transaction
): PlainTransaction => {
  return {
    oldState: transaction.startState,
    newState: transaction.state,
    changes: transaction.changes,
    selectionRanges: (transaction.selection?.ranges || []).map((range) => ({
      from: range.from,
      to: range.to
    }))
  };
};

export const composeTransactions = (
  transactions: PlainTransaction[]
): PlainTransaction => {
  return transactions.reduce((acc, transaction) => {
    if (acc === null) {
      return transaction;
    } else {
      return {
        oldState: acc.oldState,
        newState: transaction.newState,
        changes: acc.changes.compose(transaction.changes),
        selectionRanges: [
          ...acc.selectionRanges,
          ...transaction.selectionRanges
        ]
      };
    }
  }, null);
};
