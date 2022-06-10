import React from "react";
import ReactDOM from "react-dom";
import flowRight from "lodash/fp/flowRight";

import NormalizedStyleProvider from "/src/provider/normalized-style.provider";
import PersistenceProvider from "/src/provider/persistence.provider";

import { withContainer } from "/src/util/render.util";

import Application from "./component/application";

const withProviders: (children: React.ReactNode) => React.ReactNode = flowRight(
  [
    withContainer(NormalizedStyleProvider, {}),
    withContainer(PersistenceProvider, {})
  ]
);

const AppRoot = (): JSX.Element => (
  <React.Fragment>{withProviders(<Application />)}</React.Fragment>
);

ReactDOM.render(<AppRoot />, document.getElementById("root"));
