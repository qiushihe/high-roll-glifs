import { Action } from "redux";

import { RootState } from "/src/store";

export const actionSanitizer = (
  action: Action<string> | null
): Action<string> | null => {
  return action;
};

export const stateSanitizer = (state: RootState): RootState | null => {
  return state;
};
