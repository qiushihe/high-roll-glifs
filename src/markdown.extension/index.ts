import { Extension } from "@codemirror/state";

import { default as MarkdownProcessor } from "./processor/markdownProcessor";
import { default as markdownInspector } from "./extension/markdownInspector";
import { default as markdownViewPlugin } from "./extension/markdownViewPlugin";
import { default as markdownStateField } from "./extension/markdownStateField";
import { default as markdownTheme } from "./extension/markdownTheme";

export { default as MarkdownProcessor } from "./processor/markdownProcessor";

export const markdownExtension = (
  markdownProcessor: MarkdownProcessor
): Extension[] => {
  return [
    ...markdownInspector(),
    ...markdownViewPlugin(markdownProcessor),
    ...markdownStateField(markdownProcessor),
    ...markdownTheme()
  ];
};
