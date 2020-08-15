import { Extension } from "@codemirror/next/state";

import highlighter from "./gfm.highlighter";

export default (): Extension[] => [...highlighter()];
