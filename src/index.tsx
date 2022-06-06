import React from "react";
import ReactDOM from "react-dom";
import flowRight from "lodash/fp/flowRight";

import NormalizedStyleProvider from "/src/provider/normalized-style.provider";
import ReduxStoreProvider from "/src/provider/redux-store.provider";

import createStore from "/src/store/create";
import { withContainer } from "/src/util/render.util";

import Application from "./component/application";

const store = createStore({});

const withProviders: (children: React.ReactNode) => React.ReactNode = flowRight(
  [
    withContainer(NormalizedStyleProvider, {}),
    withContainer(ReduxStoreProvider, { store })
  ]
);

const AppRoot = (() =>
  React.Children.toArray([
    withProviders(<Application />)
  ])) as unknown as () => JSX.Element;

ReactDOM.render(<AppRoot />, document.getElementById("root"));
