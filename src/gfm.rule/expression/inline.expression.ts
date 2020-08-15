export const CODE_SPAN_REGEXP = new RegExp(
  "((?<!(?<!\\\\)`)((?<!\\\\)`)+(?![`]))(.+?)((?<![`])\\1(?![`]))"
);

// TODO: Make this expression great again.
export const AUTO_LINK_REGEXP = new RegExp("<([^>]*)>");
