import Promise from "bluebird";
import isFunction from "lodash/fp/isFunction";

export const invoke = fn => fn();

export const invokeWithArgsArray = callFn => argsArray => callFn(...argsArray);

export const invokeAfterPromise = afterFn => result => {
  if (result && isFunction(result.then)) {
    return result.then(afterFn);
  } else {
    return Promise.resolve().then(afterFn);
  }
};
