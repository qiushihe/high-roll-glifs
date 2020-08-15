import { Middleware } from "redux";
import thunkMiddleware from "redux-thunk";

export default (): Middleware[] => [thunkMiddleware];
