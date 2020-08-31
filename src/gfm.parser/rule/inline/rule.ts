import { ParseInlineRule } from "../../parser";

import codeSpan from "./code-span.rule";
import autoLink from "./auto-link.rule";
import imageSpan from "./image-span.rule";

export interface InlineRule {
  name: string;
  parse: ParseInlineRule;
}

export const getRules = (): InlineRule[] => [codeSpan, autoLink, imageSpan];

export const getConflictMap = (): { [key: string]: string[] } => ({
  "code-span": [
    "link-span",
    "link-span-open",
    "link-span-close",
    "image-span",
    "image-span-open",
    "image-span-middle",
    "image-span-close"
  ]
});
