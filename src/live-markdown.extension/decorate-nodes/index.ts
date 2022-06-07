import { Extension } from "@codemirror/state";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";

import { PresentationOptions } from "../presentation";
import decorateNodes from "./decorate-nodes";
import theme from "./theme";

type ExtensionConfig = {
  presentation: PresentationOptions;
  showLineTypeName: boolean;
  enableLiveNodes: boolean;
  debugLiveNodes: boolean;
};

export default (config: ExtensionConfig): Extension[] => {
  return [
    markdown({ base: markdownLanguage, addKeymap: false }),
    ...decorateNodes(),
    ...theme({
      presentation: config.presentation,
      showLineTypeName: config.showLineTypeName,
      enableLiveNodes: config.enableLiveNodes,
      debugLiveNodes: config.debugLiveNodes
    })
  ];
};
