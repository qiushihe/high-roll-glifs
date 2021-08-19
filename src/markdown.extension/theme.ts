import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

const theme = EditorView.baseTheme({
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
  },
  ".hrg-EmphasisMark": {
    display: "none"
  },
  ".hrg-line-Active": {
    backgroundColor: "#f0f8ff"
  },
  ".hrg-node-Active": {
    display: "inline-block",
    "& .hrg-EmphasisMark": {
      display: "inline"
    }
  }
});

// display: "inline-block",
// position: "relative",
// visibility: "hidden",
// "&:after": {
//   content: '""',
//   backgroundImage:
//     "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='50'/%3E%3C/svg%3E\")",
//   visibility: "visible",
//   display: "inline-block",
//   position: "absolute",
//   top: "0",
//   left: "0",
//   right: "0",
//   bottom: "0",
//   backgroundRepeat: "no-repeat",
//   backgroundPosition: "center",
//   backgroundSize: "contain"
// }

export default (): Extension[] => [theme];
