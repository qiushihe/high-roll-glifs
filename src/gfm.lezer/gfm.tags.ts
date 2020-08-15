import { TagSystem } from "@codemirror/next/highlight";

export default new TagSystem({
  flags: ["bold", "italic"],
  subtypes: 10,
  types: [
    "red-fg",
    "red-bg",
    "blue-fg",
    "blue-bg",
    "green-fg",
    "green-bg",
    "md-syntax",
    "md-text"
  ]
});
