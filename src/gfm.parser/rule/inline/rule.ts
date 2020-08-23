import { InlineTokenConflictMap, ParseInlineRule } from "../../parser";

import codeSpan from "./code-span.rule";
import autoLink from "./auto-link.rule";
import imageSpan from "./image-span.rule";

export interface InlineRule {
  name: string;
  parse: ParseInlineRule;
}

export const getRules = (): InlineRule[] => [codeSpan, autoLink, imageSpan];

export const getConflictMap = (): InlineTokenConflictMap => ({
  conflictor: {
    "code-span": ["link-span"],
  },
  conflictee: {
    "link-span": ["link-span-open", "link-span-close"],
  },
});
