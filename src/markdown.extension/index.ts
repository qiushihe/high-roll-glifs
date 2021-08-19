import { Extension } from "@codemirror/state";

import Processor from "./processor";
import inspector from "./inspector";
import viewProxy from "./view-proxy";
import markdownElements from "./markdown-elements";
import activeElements from "./active-elements";
import theme from "./theme";

export { default as MarkdownProcessor } from "./processor";

export const markdownExtension = (processor: Processor): Extension[] => {
  return [
    ...inspector(),
    ...viewProxy(processor),
    ...markdownElements(),
    ...activeElements(),
    ...theme()
  ];
};
