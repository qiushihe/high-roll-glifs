import flow from "lodash/fp/flow";
import xor from "lodash/fp/xor";
import isEmpty from "lodash/fp/isEmpty";

export const sameItemsAs = (items: unknown[]) => (
  otherItems: unknown[]
): boolean => {
  return flow([xor(items), isEmpty])(otherItems);
};
