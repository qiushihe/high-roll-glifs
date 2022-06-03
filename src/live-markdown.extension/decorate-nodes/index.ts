import { Extension } from "@codemirror/state";

import decorateNodes from "./decorate-nodes";
import theme from "./theme";

export default (): Extension[] => {
  return [...decorateNodes(), ...theme()];
};
