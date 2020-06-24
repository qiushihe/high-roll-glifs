import { handleActions } from "redux-actions";

import { CHANGE } from "/src/action/editor.action";

import { withPayload } from "/src/util/reducer.util";

import change from "./editor/change";

const initialState = {
  allEditors: {}
};

export default handleActions(
  {
    [CHANGE]: withPayload(change)
  },
  initialState
);
