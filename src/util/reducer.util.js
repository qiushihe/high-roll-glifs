export const withPayload = simpleReducerFunc => (state, { payload }) =>
  simpleReducerFunc(state, payload);
