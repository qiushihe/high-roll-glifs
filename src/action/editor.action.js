import { createPromisedAction } from "/src/util/action.util";

export const CHANGE = "APP/CHANGE";

export const change = createPromisedAction(CHANGE, [
  "editorId",
  "content",
  "selection"
]);
