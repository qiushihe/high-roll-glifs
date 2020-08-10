import syntax from "./gfm.syntax";
import highlighter from "./gfm.highlighter";

export default () => [syntax, ...highlighter()];
