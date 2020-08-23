import {
  createStore,
  applyMiddleware,
  compose,
  Reducer,
  CombinedState,
  Store,
  StoreEnhancer,
  StoreEnhancerStoreCreator,
} from "redux";

import rootReducer from "/src/reducer";
import createMiddleware from "/src/middleware/create";
import { RootState } from "./index";

import DevTools from "./dev-tools";
import { actionSanitizer, stateSanitizer } from "./sanitizers";

interface StoreExtension {
  [key: string]: unknown;
}

export default (
  initialState: RootState = {}
): Store<Reducer<CombinedState<RootState>>> =>
  createStore(
    rootReducer,
    initialState,
    compose<StoreEnhancerStoreCreator<StoreEnhancer<StoreExtension>>>(
      applyMiddleware(...createMiddleware()),
      DevTools.instrument({ actionSanitizer, stateSanitizer })
    )
  );
