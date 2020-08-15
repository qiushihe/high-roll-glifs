import {
  ATX_HEADING_LINE_REGEXP,
  SETTEXT_HEADING_LINE_REGEXP,
  SETTEXT_HEADING_UNDERLINE_REGEXP,
  BLOCK_QUOTE_LINE_REGEXP,
  THEMATIC_BREAK_LINE_REGEXP,
  PARAGRAPH_LINE_REGEXP,
  BLANK_LINE_REGEXP
} from "./block.expression";

import { CODE_SPAN_REGEXP, AUTO_LINK_REGEXP } from "./inline.expression";

export const getBlockExpressions = (): { name: string; regexp: RegExp }[] => [
  { name: "atx-heading", regexp: ATX_HEADING_LINE_REGEXP },
  { name: "settext-heading-line", regexp: SETTEXT_HEADING_LINE_REGEXP },
  {
    name: "settext-heading-underline",
    regexp: SETTEXT_HEADING_UNDERLINE_REGEXP
  },
  { name: "block-quote", regexp: BLOCK_QUOTE_LINE_REGEXP },
  { name: "thematic-break", regexp: THEMATIC_BREAK_LINE_REGEXP },
  { name: "paragraph", regexp: PARAGRAPH_LINE_REGEXP },
  { name: "blank", regexp: BLANK_LINE_REGEXP }
];

export const getInlineExpressions = (): { name: string; regexp: RegExp }[] => [
  { name: "code-span", regexp: CODE_SPAN_REGEXP },
  { name: "auto-link", regexp: AUTO_LINK_REGEXP }
];
