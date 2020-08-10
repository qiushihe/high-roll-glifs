import { Extension } from "@codemirror/next/state";

import baseHighlighter from "./highlighter/base.highlighter";
import activeMarkHighlighter from "./highlighter/active-mark.highlighter";
import inlineStyleHighlighter from "./highlighter/inline-style.highlighter";

export default (): Extension[] => [
  baseHighlighter,
  ...activeMarkHighlighter(),
  ...inlineStyleHighlighter()
];
