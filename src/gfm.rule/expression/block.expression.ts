export const ATX_HEADING_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})(#{1,6})((\\s)(.*?))?(\\s+#+\\s*)?$",
  "i"
);

export const SETTEXT_HEADING_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})(([^\\s]\\s*?)+)(\\s*)$",
  "i"
);

export const SETTEXT_HEADING_UNDERLINE_REGEXP = new RegExp(
  "^(\\s{0,3})((-+)|(=+))(\\s*)$",
  "i"
);

export const BLOCK_QUOTE_LINE_REGEXP = new RegExp("^(\\s{0,3}>\\s?)(.*)$", "i");

export const THEMATIC_BREAK_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})((-\\s*?){3,}|(_\\s*?){3,}|(\\*\\s*?){3,})(\\s*)$",
  "i"
);

export const PARAGRAPH_LINE_REGEXP = new RegExp("^(\\s*[^\\s]+\\s*)+$", "i");

export const BLANK_LINE_REGEXP = new RegExp("^\\s+$", "i");
