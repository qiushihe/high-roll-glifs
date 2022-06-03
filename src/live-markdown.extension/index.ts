import { Extension } from "@codemirror/state";

import Processor from "./processor";
import viewProxy from "./view-proxy";
import decorateMarkdown from "./decorate-nodes";
import inspectCursor from "./inspect-cursor";
import highlightActiveLine from "./highlight-active-line";
import liveNodes from "./live-nodes";

type ExtensionConfig = {
  processor: Processor;
  inspector?: boolean;
  liveNodes?: boolean;
};

export const liveMarkdown = (config: ExtensionConfig): Extension[] => {
  return [
    ...viewProxy(config.processor),
    ...decorateMarkdown(),
    ...highlightActiveLine(),
    ...(config.inspector ? inspectCursor() : []),
    ...(config.liveNodes ? liveNodes() : [])
  ];
};

export { default as LiveMarkdownProcessor } from "./processor";