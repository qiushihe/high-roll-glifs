import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import getOr from "lodash/fp/getOr";
import last from "lodash/fp/last";

export const getInlineContext = getOr({}, "inline");

export const getPreviousInlineContext = flow([
  get("previousLines"),
  last,
  getOr({}, "inline")
]);
