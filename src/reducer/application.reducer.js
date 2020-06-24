import { handleActions } from "redux-actions";

import { BOOT } from "/src/action/application.action";

import { withPayload } from "/src/util/reducer.util";

import boot from "./application/boot";

const initialState = {};

export default handleActions(
  {
    [BOOT]: withPayload(boot)
  },
  initialState
);
