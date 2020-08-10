import { Extension } from "@codemirror/next/state";

import syntax from "./gfm.syntax";
import highlighter from "./gfm.highlighter";

export default (): Extension[] => [syntax, ...highlighter()];
