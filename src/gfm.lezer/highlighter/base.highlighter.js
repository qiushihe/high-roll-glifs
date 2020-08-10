import tags from "../gfm.tags";

export default tags.highlighter({
  "red-fg": { color: "#ff0000" },
  "red-bg": { backgroundColor: "#ff0000" },
  "blue-bg": { backgroundColor: "#0000ff" },
  "green-bg": { backgroundColor: "#00ff00" },

  "md-syntax": {
    color: "#969696",
    fontFamily: "monospace"
    // fontSize: "0px"
  },

  "md-text": { fontFamily: "serif" }
});
