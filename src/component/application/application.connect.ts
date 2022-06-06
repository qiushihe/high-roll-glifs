import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { connect } from "react-redux";

import { RootState } from "/src/store";
import { boot as appBoot } from "/src/action/application.action";

import Application from "./application";

export default connect(
  null,
  (dispatch: ThunkDispatch<RootState, unknown, Action<string>>) => ({
    appBoot: () => dispatch(appBoot())
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...(stateProps || {}),
    ...dispatchProps,
    ...ownProps,
    onMount: dispatchProps.appBoot
  })
)(Application as any);
