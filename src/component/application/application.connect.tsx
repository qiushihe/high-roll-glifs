import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { connect } from "react-redux";

import { RootState } from "/src/store";
import { boot as appBoot } from "/src/action/application.action";

import Application, { ApplicationProps } from "./application";

type StateProps = null;

type DispatchProps = {
  appBoot: () => void;
};

export default connect<StateProps, DispatchProps, ApplicationProps>(
  null,
  (dispatch: ThunkDispatch<RootState, unknown, Action<string>>) => ({
    appBoot: () => dispatch(appBoot())
  }),
  (stateProps, dispatchProps, ownProps) => {
    return {
      ...(stateProps || {}),
      ...dispatchProps,
      ...ownProps,
      onMount: dispatchProps.appBoot
    };
  }
)(Application);
