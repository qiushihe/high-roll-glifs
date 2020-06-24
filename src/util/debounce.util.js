import Promise from "bluebird";
import flow from "lodash/fp/flow";
import constant from "lodash/fp/constant";

import {
  invokeWithArgsArray,
  invokeAfterPromise
} from "/src/util/function.util";

const PARAMS_FROM_HEAD = "PARAMS_FROM_HEAD";
const PARAMS_FROM_TAIL = "PARAMS_FROM_TAIL";
const DEFAULT_INTERVAL = 500;

export const debounceOnCompletion = ({
  interval = DEFAULT_INTERVAL,
  paramsFrom = PARAMS_FROM_TAIL
} = {}) => {
  const deBouncer = {};

  let perform = constant(undefined);
  let performedAt = 0;
  let performArgs = null;
  let performTimeout = null;

  const resetPerformTimeout = () => {
    if (performTimeout !== null) {
      clearTimeout(performTimeout);
      performTimeout = null;
    }
  };

  const resetPerformedAt = () => {
    performedAt = new Date().getTime();
    performArgs = null;
  };

  deBouncer.do = performFn => {
    perform = performFn;
    return deBouncer;
  };

  deBouncer.call = (...args) => {
    return new Promise(resolve => {
      resetPerformTimeout();

      if (new Date().getTime() - performedAt > interval) {
        if (paramsFrom === PARAMS_FROM_TAIL) {
          performArgs = args;
        }

        flow([
          invokeWithArgsArray(perform),
          invokeAfterPromise(resetPerformedAt)
        ])(performArgs);
      } else {
        if (paramsFrom === PARAMS_FROM_HEAD && performArgs === null) {
          performArgs = args;
        }

        performTimeout = setTimeout(() => deBouncer.call(...args), interval);
      }

      resolve();
    });
  };

  return deBouncer;
};
