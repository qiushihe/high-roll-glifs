import { combineReducers } from "redux";

import application from "./application.reducer";
import editor from "./editor.reducer";

export default () => combineReducers({ application, editor });
