import { handleActions } from "redux-actions";

import { BOOT } from "/src/action/application.action";

import { withPayload } from "/src/util/reducer.util";

import boot from "./application/boot";

export interface ApplicationState {
  UNUSED_value?: unknown;
}

interface BootPayload {
  UNUSED_value?: unknown;
}

type ApplicationPayload = BootPayload;

const initialState: ApplicationState = {};

export default handleActions<ApplicationState, ApplicationPayload>(
  {
    [BOOT]: withPayload(boot),
  },
  initialState
);
