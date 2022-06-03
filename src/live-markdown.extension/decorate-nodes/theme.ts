import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

const theme = EditorView.baseTheme({
  ".cm-line": {
    // fontFamily: "sans-serif"
  },
  ...[
    "CodeBlock",
    "FencedCode",
    "Blockquote",
    "HorizontalRule",
    "BulletList",
    "OrderedList",
    "ListItem",
    "ATXHeading1",
    "ATXHeading2",
    "ATXHeading3",
    "ATXHeading4",
    "ATXHeading5",
    "ATXHeading6",
    "SetextHeading1",
    "SetextHeading2",
    "HTMLBlock",
    "LinkReference",
    "Paragraph",
    "CommentBlock",
    "ProcessingInstructionBlock"
  ].reduce(
    (acc, typeName) => ({
      ...acc,
      [`.hrg-line-${typeName}`]: {
        position: "relative",
        "&:after": {
          content: `"${typeName}"`,
          display: "block",
          position: "absolute",
          top: "0",
          right: "6px",
          fontFamily: "monospace",
          fontSize: "10px"
        }
      }
    }),
    {}
  ),
  ...[1, 2, 3, 4, 5, 6].reduce(
    (acc, level) => ({
      ...acc,
      [`.hrg-ATXHeading${level}, .hrg-SetextHeading${level}`]: {
        fontSize: `${36 - (level - 1) * 4}px`
      }
    }),
    {}
  ),
  ".hrg-Emphasis": {
    fontStyle: "italic"
  },
  ".hrg-StrongEmphasis": {
    fontWeight: "bold"
  },
  ".hrg-HeaderMark": {
    color: "grey"
  },
  ".hrg-ListMark": {
    color: "red"
  }
});

export default (): Extension[] => [theme];