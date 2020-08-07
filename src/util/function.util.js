import flow from "lodash/fp/flow";
import isEmpty from "lodash/fp/isEmpty";
import without from "lodash/fp/without";

export const invoke = fn => fn();

export const sameItemsAs = items => flow([without(items), isEmpty]);
