import { Extension } from "@codemirror/state";

import { PresentationOptions } from "./presentation";
import Processor from "./processor";
import viewProxy from "./view-proxy";
import decorateNodes from "./decorate-nodes";
import inspectCursor from "./inspect-cursor";
import highlightActiveLine from "./highlight-active-line";

type ExtensionOptions = {
  showInspector: boolean;
  enableLiveNodes: boolean;
  debugLiveNodes: boolean;
  highlightActiveLine: boolean;
};

type ExtensionConfig = {
  processor: Processor;
  presentation: PresentationOptions;
  options: ExtensionOptions;
};

export const liveMarkdown = (config: ExtensionConfig): Extension[] => {
  return [
    ...viewProxy(config.processor),
    ...decorateNodes({
      presentation: config.presentation,
      showLineTypeName: config.options.showInspector,
      enableLiveNodes: config.options.enableLiveNodes,
      debugLiveNodes: config.options.debugLiveNodes
    }),
    ...(config.options.highlightActiveLine
      ? highlightActiveLine({ presentation: config.presentation })
      : []),
    ...(config.options.showInspector ? inspectCursor() : [])
  ];
};

export { default as LiveMarkdownProcessor } from "./processor";

export type { PresentationOptions } from "./presentation";
