import { Extension } from "@codemirror/state";

import decorateNodes from "./decorate-nodes";
import theme from "./theme";

type ExtensionConfig = {
  inspector: boolean;
};

export default (config: ExtensionConfig): Extension[] => {
  return [...decorateNodes(), ...theme({ showLineTypeName: config.inspector })];
};
