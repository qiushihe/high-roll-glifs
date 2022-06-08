import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

import { PresentationOptions } from "../presentation";
import { ACTIVE_NODE_CLASS_NAME } from "./decoration";

type ThemeConfig = {
  showLineTypeName: boolean;
  presentation: PresentationOptions;
};

const theme = (config: ThemeConfig) => {
  return EditorView.baseTheme({
    ".cm-line": {
      fontFamily: config.presentation.fontFamily
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
          color: config.presentation.textColor,
          ...(typeName === "FencedCode" || typeName === "CodeBlock"
            ? {
                fontFamily: config.presentation.monospaceFontFamily
              }
            : {}),
          ...(config.showLineTypeName
            ? {
                "&:after": {
                  content: `"${typeName}"`,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  position: "absolute",
                  top: "0",
                  right: "6px",
                  height: "100%",
                  fontFamily: config.presentation.monospaceFontFamily,
                  fontSize: "10px"
                }
              }
            : {})
        }
      }),
      {}
    ),
    ...["Blockquote", "QuoteMark"].reduce(
      (acc, markName) => ({
        ...acc,
        [`.hrg-${markName}`]: {
          color: config.presentation.quotedTextColor
        }
      }),
      {}
    ),
    ...["ListMark"].reduce(
      (acc, markName) => ({
        ...acc,
        [`.hrg-${markName}`]: {
          color: config.presentation.textColor
        }
      }),
      {}
    ),
    ...["HeaderMark", "LinkMark", "EmphasisMark", "CodeMark"].reduce(
      (acc, markName) => ({
        ...acc,
        [`.hrg-${markName}`]: {
          color: config.presentation.markColor
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
    ".hrg-InlineCode": {
      fontFamily: config.presentation.monospaceFontFamily,
      backgroundColor: config.presentation.codeBackgroundColor
    },
    ".hrg-CodeText": {
      fontFamily: config.presentation.monospaceFontFamily
    }
  });
};

const LIVE_NODE_STYLE = {
  inactive: { display: "none" },
  active: { display: "inline" },
  debug: {
    inactive: { opacity: 0.5 },
    active: { opacity: 1 }
  }
};

type LiveNodesThemeConfig = {
  debugLiveNodes: boolean;
};

const liveNodesTheme = (config: LiveNodesThemeConfig) => {
  const NODE_INACTIVE = config.debugLiveNodes
    ? LIVE_NODE_STYLE.debug.inactive
    : LIVE_NODE_STYLE.inactive;
  const NODE_ACTIVE = config.debugLiveNodes
    ? LIVE_NODE_STYLE.debug.active
    : LIVE_NODE_STYLE.active;

  return EditorView.baseTheme({
    ".hrg-Emphasis": {
      "& .hrg-EmphasisMark": { ...NODE_INACTIVE },
      [`&.${ACTIVE_NODE_CLASS_NAME}`]: {
        "& .hrg-EmphasisMark": { ...NODE_ACTIVE }
      }
    },
    ".hrg-StrongEmphasis": {
      "& .hrg-EmphasisMark": { ...NODE_INACTIVE },
      [`&.${ACTIVE_NODE_CLASS_NAME}`]: {
        "& .hrg-EmphasisMark": { ...NODE_ACTIVE }
      }
    },
    ".hrg-InlineCode": {
      "& .hrg-CodeMark": { ...NODE_INACTIVE },
      [`&.${ACTIVE_NODE_CLASS_NAME}`]: {
        "& .hrg-CodeMark": { ...NODE_ACTIVE }
      }
    },
    ...[1, 2, 3, 4, 5, 6].reduce(
      (acc, level) => ({
        ...acc,
        [`.hrg-ATXHeading${level}`]: {
          "& .hrg-HeaderMark": { ...NODE_INACTIVE },
          "& .hrg-HeaderGap": { ...NODE_INACTIVE },
          [`&.${ACTIVE_NODE_CLASS_NAME}`]: {
            "& .hrg-HeaderMark": { ...NODE_ACTIVE },
            "& .hrg-HeaderGap": { ...NODE_ACTIVE }
          }
        }
      }),
      {}
    ),
    ...[1, 2].reduce(
      (acc, level) => ({
        ...acc,
        [`.hrg-SetextHeading${level}`]: {
          "& .hrg-HeaderMark": { ...NODE_INACTIVE },
          [`&.${ACTIVE_NODE_CLASS_NAME}`]: {
            "& .hrg-HeaderMark": { ...NODE_ACTIVE }
          }
        }
      }),
      {}
    ),
    ".hrg-FencedCode": {
      "& .hrg-CodeMark": { ...NODE_INACTIVE },
      "& .hrg-CodeInfo": { ...NODE_INACTIVE },
      [`&.${ACTIVE_NODE_CLASS_NAME}`]: {
        "& .hrg-CodeMark": { ...NODE_ACTIVE },
        "& .hrg-CodeInfo": { ...NODE_ACTIVE }
      }
    },
    ".hrg-Link": {
      "& .hrg-LinkMark": { ...NODE_INACTIVE },
      "& .hrg-URL": { ...NODE_INACTIVE },
      [`&.${ACTIVE_NODE_CLASS_NAME}`]: {
        "& .hrg-LinkMark": { ...NODE_ACTIVE },
        "& .hrg-URL": { ...NODE_ACTIVE }
      }
    }
  });
};

type ExtensionConfig = ThemeConfig &
  LiveNodesThemeConfig & {
    enableLiveNodes: boolean;
  };

export default (config: ExtensionConfig): Extension[] => [
  theme({
    showLineTypeName: config.showLineTypeName,
    presentation: config.presentation
  }),
  ...(config.enableLiveNodes
    ? [liveNodesTheme({ debugLiveNodes: config.debugLiveNodes })]
    : [])
];
