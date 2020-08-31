import Promise from "bluebird";
import { Action } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { createAction } from "redux-actions";
import flow from "lodash/fp/flow";
import pick from "lodash/fp/pick";
import cond from "lodash/fp/cond";
import isFunction from "lodash/fp/isFunction";
import stubTrue from "lodash/fp/stubTrue";
import identity from "lodash/fp/identity";
import constant from "lodash/fp/constant";

import { RootState } from "/src/store";
import { invoke } from "/src/util/function.util";

export interface InputPayload {
  [key: string]: unknown;
}

export interface ActionPayload {
  [key: string]: unknown;
}

export type PayloadMutator = (payload?: ActionPayload) => ActionPayload | null;

export type DispatchMe = (mutator: PayloadMutator) => Promise<unknown>;

export type DispatchFn = (
  dispatchMe: DispatchMe,
  payload: InputPayload | null | undefined,
  dispatch: ThunkDispatch<RootState, unknown, Action<string>>,
  getState: () => RootState
) => void;

// This function creates Promise-thunk'ed Redux action with structured
// action payload constructor, and with the optional ability to override
// the constructed structured payloads.
//
// The reason for using this function to create Redux action function is
// so that we never have to worry about is the dispatch of a particular
// action is chain-able (i.e. is the action is plain, or if it's thunk'ed).
//
// Consider this example:
//
// ```
// const doOne = createAction("ACTION_ONE", ({ name }) => ({ name }));
// const doTwo = ({ name }) => (dispatch) => {
//   return doSomeAsyncStuff().then(() => {
//     dispatch({ type: "ACTION_TWO", payload: { name } });
//   });
// };
// ```
//
// ... in the above example, when we actually dispatch `doOne` and `doTwo`,
// it's unclear which action is chain-able and which is not:
//
// ```
// dispatch(doOne({ name: "Billy" })); // This one is not chain-able ...
// dispatch(doTwo({ name: "Billy" })).then(...); // ... however this one is
// ```
//
// ... so if `doOne` and `doTwo` were created with `createPromisedAction`,
// their definition would look like:
//
// ```
// const doOne = createPromisedAction("ACTION_ONE", ["name"]);
// const doTwo = createPromisedAction("ACTION_TWO", ["name"], (dispatchMe) => {
//   return doSomeAsyncStuff().then(dispatchMe);
// });
// ```
//
// ... and now both `doOne` and `doTwo` are thunk'ed and chain-able:
//
// ```
// dispatch(doOne({ name: "Billy" })).then(...); // This is chain-able ...
// dispatch(doTwo({ name: "Billy" })).then(...); // ... and so is this.
// ```
//
// The parameter list for `createPromisedAction` is as follow:
//
// * type: String; The name of the action
// * payloadAttrs: Array of strings; The list of attribute names that should be
//                 plucked from the first argument to the call of the action
//                 function (see below for more).
// * dispatchFn: Function; A HOF function that would be responsible for
//               actually calling the Redux `dispatch` function to dispatch
//               the action (see below for more).
//
// More on `payloadAttrs`: By using this structured array of attribute names,
// we no longer have to micro-manage the construction of action payload from
// the arguments to the action function. Consider this example from above:
//
// ```
// const doOne = createAction("ACTION_ONE", ({ name }) => ({ name }));
// ```
// ... this definition can be re-written as:
//
// ```
// const doOne = createAction("ACTION_ONE", (input) => {
//   return { name: input.name };
// });
// ```
//
// ... this action function basically says: "you can call me with whatever you
// want (i.e. `doOne({ name: "Billy", age: 42 })`) but I'm only going to take
// the `name` attribute from the input. This is essentially a form validation
// where we want to prevent unwanted attributes from polluting the action's
// `payload` object.
//
// Since having to write out the attributes-plucking function for each action
// definition is very cumbersome so by using `createPromisedAction`:
//
// ```
// const doOne = createPromisedAction("ACTION_ONE", ["name"]);
// ```
//
// ... is a lot cleaner.
//
// More on `dispatchFn`: The `dispatchFn` HOF is called with the following
// parameter list:
// * dispatchMe: The first argument to `dispatchFn` is a function that when
//               called, would dispatch the action object. Simply calling
//               `dispatchMe` and without any arguments to it is the default
//               use case, and in this case the action object would be
//               dispatched with the structured payload object.
//               A second use case of the `dispatchMe` is to call it with a
//               single argument which is a "payload mutator" function. In this
//               case the "payload mutator" function receives the structured
//               payload object, and is expected to return a mutated payload
//               object. Calling `dispatchMe` with a "payload mutator" function
//               would cause the action object to be dispatched with the
//               mutated payload object.
// * inputPayload: The raw first argument called to the action function. This
//                 is intended to be used in conjunction with the last 2
//                 arguments (`dispatch` and `getState`) to override the
//                 default action dispatching behaviour of `dispatchMe`.
// * dispatch: The `dispatch` function from Redux
// * getState: The `getState` function from Redux
//
// Since the default value for `dispatchFn` is `invoke` which is defined as:
//
// ```
// const invoke = (fn) => fn();
// ```
//
// ... which means `invoke` simply calls the first argument as a function. And
// that means when `createPromisedAction` is called without a parameter value
// for `dispatchFn`, it's the same as if the `dispatchFn` would simply call
// its first argument which is the `dispatchMe` function which would in turn
// cause the default use case described above to happen.
//
// To customize the behaviour of the action function created from
// `createPromisedAction`, one should pass in a custom `dispatchFn` to perform
// any additional work before and/or after the action being dispatched.
//
// For example, to further mutate a structured payload attribute:
//
// ```
// const doOne = createPromisedAction("ACTION_ONE", ["name"], (dispatchMe) => {
//   const payloadMutator = (structuredPayload) => {
//     return { name: structuredPayload.name.toLowerCase() };
//   };
//   return dispatchMe(payloadMutator);
// });
// ```
//
// To perform tasks before/after action dispatch:
//
// ```
// const doOne = createPromisedAction("ACTION_ONE", ["name"], (dispatchMe) => {
//   doSomethingSyncBefore();
//   return doSomethingASyncBefore()
//     .then(() => dispatchMe())
//     .then(() => {
//       doSomethingSyncAfter();
//       return doSomethingASyncAfter();
//     });
// });
// ```
//
// And the 2 examples above can be combined:
//
// ```
// const doOne = createPromisedAction("ACTION_ONE", ["name"], (dispatchMe) => {
//   const payloadMutator = (structuredPayload) => {
//     return { name: structuredPayload.name.toLowerCase() };
//   };
//   doSomethingSyncBefore();
//   return doSomethingASyncBefore()
//     .then(() => dispatchMe(payloadMutator))
//     .then(() => {
//       doSomethingSyncAfter();
//       return doSomethingASyncAfter();
//     });
// });
// ```
//
// To forgo the provided `dispatchMe` and instead use a custom action dispatch
// function:
//
// ```
// const doOne = createPromisedAction(
//   "ACTION_ONE",
//   ["name"],
//   (_, inputPayload, dispatch, getState) => {
//     const payload = {
//       firstName: inputPayload.name,
//       // Using `inputPayload` is not restricted by the structured payload
//       // plucking function, therefore even though the `payloadAttrs` has the
//       // value of `["name"]`, we can still access any additional attributes
//       // from `inputPayload`.
//       age: inputPayload.age,
//       // Since we have access to `getState`, we can call it with any of the
//       // already defined selector functions.
//       gender: genderSelector(getState())
//     };
//
//     // Since we're not using `dispatchMe`, the action object's `type`
//     // is NOT pre-constructed so we have to manually create the action
//     // with the correct `type` string and the `payload` above.
//     const actionObject = { type: "ACTION_ONE", payload };
//
//     // Now we can with dispatch the `actionObject` directly:
//     // ```
//     // return dispatch(actionObject);
//     // ```
//     // ... or we can return a promise if we need to do some a-sync tasks:
//     return doSomethingASync()
//       .then(() => dispatch(actionObject));
//   }
// );
// ```
export const createPromisedAction = (
  type: string,
  payloadAttrs = [],
  dispatchFn: DispatchFn = invoke
): ((
  input?: InputPayload | null
) => ThunkAction<Promise<unknown>, RootState, unknown, Action<string>>) => {
  // Create a structured action creator function that create action with
  // payload objects with attributes plucked from the input to the promised
  // action function.
  const createStructuredAction = createAction(
    type,
    isFunction(payloadAttrs) ? payloadAttrs : pick(payloadAttrs)
  );

  // Return a thunk'able function for all action functions created
  // by `createPromisedAction`.
  return (inputPayload) => (dispatch, getState) => {
    // Always return a promise for the action to ensure all action
    // dispatches are chain-able.
    return Promise.resolve().then(() => {
      // Call the `dispatchFn` to dispatch the action.
      return dispatchFn(
        // For the `dispatchMe` function ...
        (payloadMutator: PayloadMutator) => {
          // ... always return a promise to maintain the promise chain.
          return (
            Promise.resolve(createStructuredAction(inputPayload || {}))
              .then((plainAction) => ({
                ...plainAction,
                payload: flow([
                  // If the provided `payloadMutator` ...
                  cond([
                    // ... is a function, then use it in the next step.
                    [isFunction, identity],
                    // ... is not a function, then use `identity` (a function
                    // that simply returns its first argument) in the next step.
                    [stubTrue, constant(identity)]
                  ]),
                  // Use the `mutate` function from the previous step to mutate
                  // the structured payload in the action.
                  (mutate) => mutate(plainAction.payload)
                ])(payloadMutator)
              }))
              // After the action's payload is mutated (or not) ...
              .then((action) => {
                // ... dispatch the action ...
                dispatch(action);
                // ... and also return the action object to other functions
                // in the same promise-chain can access the dispatched action.
                return action;
              })
          );
        },
        inputPayload,
        dispatch,
        getState
      );
    });
  };
};
