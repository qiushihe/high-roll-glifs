import get from "lodash/fp/get";
import size from "lodash/fp/size";

export const invoke = fn => fn();

export const getFromMany = (...args) => (...objects) => {
  let result;

  for (let objectIndex = 0; objectIndex < size(objects); objectIndex++) {
    const value = get(...args)(objects[objectIndex]);

    if (value !== undefined) {
      result = value;
      break;
    }
  }

  return result;
};
