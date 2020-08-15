import { combineReducers, Reducer, CombinedState } from "redux";

import { RootState } from "/src/store";

import application from "./application.reducer";

export default (): Reducer<CombinedState<RootState>> =>
  combineReducers<RootState>({ application });
