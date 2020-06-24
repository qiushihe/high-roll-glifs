import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";

import { boot as appBoot } from "/src/action/application.action";

import Application from "./application";

export default connect(
  createStructuredSelector({}),
  dispatch => ({
    appBoot: () => dispatch(appBoot())
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    onMount: dispatchProps.appBoot
  })
)(Application);
