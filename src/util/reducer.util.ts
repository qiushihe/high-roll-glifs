import { Action } from "redux";
import get from "lodash/get";

export const withPayload = <TState, TPayload>(
  simpleReducerFunc: (state: TState, payload: TPayload) => TState
) => (state: TState, action: Action<TPayload>): TState =>
  simpleReducerFunc(state, get(action, "payload"));
