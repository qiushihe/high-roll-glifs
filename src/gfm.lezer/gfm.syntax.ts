import { LezerSyntax } from "@codemirror/next/syntax";

import tags from "./gfm.tags";
import parser from "./gfm.parser";

export default LezerSyntax.define(
  parser.withProps(
    tags.add({
      AtxPrefix: "md-syntax",
      AtxLevel: "md-syntax",
      AtxSpace: "md-syntax",
      AtxText: "md-text",
      AtxSuffix: "md-syntax",

      ThematicBreakPrefix: "md-syntax",
      ThematicBreakText: "md-text",
      ThematicBreakSuffix: "md-syntax",

      BlockQuotePrefix: "md-syntax",
      BlockQuoteText: "md-text",

      ParagraphTextNormal: "md-text",
      ParagraphTextCodeSpan: "blue-bg",
      ParagraphTextAutoLink: "green-bg",

      SettextPrefix: "md-syntax",
      SettextText: "md-text",
      SettextSuffix: "md-syntax",
      SettextBreak: "md-syntax",
      SettextUnderlinePrefix: "md-syntax",
      SettextUnderlineText: "md-syntax",
      SettextUnderlineSuffix: "md-syntax"
    })
  )
);
