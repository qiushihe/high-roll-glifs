import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

import { ACTIVE_NODE_CLASS_NAME } from "./decoration";

type ThemeConfig = {
  showLineTypeName: boolean;
};

const theme = (config: ThemeConfig) =>
  EditorView.baseTheme({
    ".cm-line": {
      fontFamily: '"Open Sans", sans-serif'
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
          ...(config.showLineTypeName
            ? {
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
            : {})
        }
      }),
      {}
    ),
    ...[1, 2, 3, 4, 5, 6].reduce(
      (acc, level) => ({
        ...acc,
        [`.hrg-ATXHeading${level}`]: {
          fontSize: `${36 - (level - 1) * 4}px`
        }
      }),
      {}
    ),
    ...[1, 2].reduce(
      (acc, level) => ({
        ...acc,
        [`.hrg-SetextHeading${level}`]: {
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
    ".hrg-InlineCode": {
      fontFamily: '"Source Code Pro", monospace'
    },
    ".hrg-line-FencedCode": {
      fontFamily: '"Source Code Pro", monospace'
    },
    ".hrg-line-CodeBlock": {
      fontFamily: '"Source Code Pro", monospace'
    }
  });

const DEBUG = false;

const STYLES_INACTIVE = DEBUG ? { opacity: 0.5 } : { display: "none" };

const STYLES_ACTIVE = DEBUG ? { opacity: 1 } : { display: "inline" };

const loveNodesTheme = () =>
  EditorView.baseTheme({
    ".hrg-Emphasis": {
      "& .hrg-EmphasisMark": { ...STYLES_INACTIVE },
      [`&.${ACTIVE_NODE_CLASS_NAME}`]: {
        "& .hrg-EmphasisMark": { ...STYLES_ACTIVE }
      }
    },
    ".hrg-StrongEmphasis": {
      "& .hrg-EmphasisMark": { ...STYLES_INACTIVE },
      [`&.${ACTIVE_NODE_CLASS_NAME}`]: {
        "& .hrg-EmphasisMark": { ...STYLES_ACTIVE }
      }
    },
    ".hrg-InlineCode": {
      "& .hrg-CodeMark": { ...STYLES_INACTIVE },
      [`&.${ACTIVE_NODE_CLASS_NAME}`]: {
        "& .hrg-CodeMark": { ...STYLES_ACTIVE }
      }
    },
    ...[1, 2, 3, 4, 5, 6].reduce(
      (acc, level) => ({
        ...acc,
        [`.hrg-ATXHeading${level}`]: {
          "& .hrg-HeaderMark": { ...STYLES_INACTIVE },
          "& .hrg-HeaderGap": { ...STYLES_INACTIVE },
          [`&.${ACTIVE_NODE_CLASS_NAME}`]: {
            "& .hrg-HeaderMark": { ...STYLES_ACTIVE },
            "& .hrg-HeaderGap": { ...STYLES_ACTIVE }
          }
        }
      }),
      {}
    ),
    ...[1, 2].reduce(
      (acc, level) => ({
        ...acc,
        [`.hrg-SetextHeading${level}`]: {
          "& .hrg-HeaderMark": { ...STYLES_INACTIVE },
          [`&.${ACTIVE_NODE_CLASS_NAME}`]: {
            "& .hrg-HeaderMark": { ...STYLES_ACTIVE }
          }
        }
      }),
      {}
    ),
    ".hrg-FencedCode": {
      "& .hrg-CodeMark": { ...STYLES_INACTIVE },
      "& .hrg-CodeInfo": { ...STYLES_INACTIVE },
      [`&.${ACTIVE_NODE_CLASS_NAME}`]: {
        "& .hrg-CodeMark": { ...STYLES_ACTIVE },
        "& .hrg-CodeInfo": { ...STYLES_ACTIVE }
      }
    }
  });

type ExtensionConfig = ThemeConfig;

export default (config: ExtensionConfig): Extension[] => [
  theme({ showLineTypeName: config.showLineTypeName }),
  loveNodesTheme()
];
