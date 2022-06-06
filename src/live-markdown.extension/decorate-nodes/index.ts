import { Extension } from "@codemirror/state";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";

import decorateNodes from "./decorate-nodes";
import theme from "./theme";

type ExtensionConfig = {
  inspector: boolean;
};

export default (config: ExtensionConfig): Extension[] => {
  return [
    markdown({ base: markdownLanguage, addKeymap: false }),
    ...decorateNodes(),
    ...theme({ showLineTypeName: config.inspector })
  ];
};
