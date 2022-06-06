import { Extension } from "@codemirror/state";

import Processor from "./processor";
import viewProxy from "./view-proxy";
import decorateNodes from "./decorate-nodes";
import inspectCursor from "./inspect-cursor";
import highlightActiveLine from "./highlight-active-line";

type ExtensionConfig = {
  processor: Processor;
  inspector?: boolean;
  liveNodes?: boolean;
};

export const liveMarkdown = (config: ExtensionConfig): Extension[] => {
  return [
    ...viewProxy(config.processor),
    ...decorateNodes({ inspector: !!config.inspector }),
    ...highlightActiveLine(),
    ...(config.inspector ? inspectCursor() : [])
  ];
};

export { default as LiveMarkdownProcessor } from "./processor";
