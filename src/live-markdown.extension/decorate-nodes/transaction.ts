import { ChangeSet, EditorState, Transaction } from "@codemirror/state";

export type PlainTransaction = {
  oldState: EditorState;
  newState: EditorState;
  changes: ChangeSet;
};

export const decodeTransaction = (
  transaction: Transaction
): PlainTransaction => {
  return {
    oldState: transaction.startState,
    newState: transaction.state,
    changes: transaction.changes
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
        changes: acc.changes.compose(transaction.changes)
      };
    }
  }, null);
};
