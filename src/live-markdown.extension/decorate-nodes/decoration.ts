import { Decoration } from "@codemirror/view";

type DecorationFn = (name: string) => Decoration;

export const ACTIVE_NODE_CLASS_NAME = "hrg-ActiveNode";

const lineDecoration: DecorationFn = (name: string) => {
  return Decoration.line({
    attributes: { class: `hrg-line-${name}` }
  });
};

const markDecoration: DecorationFn = (name: string) => {
  return Decoration.mark({
    attributes: { class: `hrg-${name}` }
  });
};

const activeMarkDecoration: DecorationFn = (name: string) => {
  return Decoration.mark({
    attributes: { class: `hrg-${name} ${ACTIVE_NODE_CLASS_NAME}` }
  });
};

const makeDecorations = (acc, [name, decorationFn]) => ({
  ...acc,
  [name]: decorationFn(name)
});

const DECORATION = {
  line: (
    [
      ["CodeBlock", lineDecoration],
      ["FencedCode", lineDecoration],
      ["Blockquote", lineDecoration],
      ["HorizontalRule", lineDecoration],
      ["BulletList", lineDecoration],
      ["OrderedList", lineDecoration],
      ["ListItem", lineDecoration],
      ["ATXHeading1", lineDecoration],
      ["ATXHeading2", lineDecoration],
      ["ATXHeading3", lineDecoration],
      ["ATXHeading4", lineDecoration],
      ["ATXHeading5", lineDecoration],
      ["ATXHeading6", lineDecoration],
      ["SetextHeading1", lineDecoration],
      ["SetextHeading2", lineDecoration],
      ["HTMLBlock", lineDecoration],
      ["Paragraph", lineDecoration]
    ] as [string, DecorationFn][]
  ).reduce(makeDecorations, {}),
  node: (
    [
      ["CodeBlock", markDecoration],
      ["CodeText", markDecoration],
      ["FencedCode", markDecoration],
      ["Blockquote", markDecoration],
      ["HorizontalRule", markDecoration],
      ["BulletList", markDecoration],
      ["OrderedList", markDecoration],
      ["ListItem", markDecoration],
      ["ATXHeading1", markDecoration],
      ["ATXHeading2", markDecoration],
      ["ATXHeading3", markDecoration],
      ["ATXHeading4", markDecoration],
      ["ATXHeading5", markDecoration],
      ["ATXHeading6", markDecoration],
      ["SetextHeading1", markDecoration],
      ["SetextHeading2", markDecoration],
      ["HTMLBlock", markDecoration],
      ["Paragraph", markDecoration],
      ["Emphasis", markDecoration],
      ["StrongEmphasis", markDecoration],
      ["Link", markDecoration],
      ["Image", markDecoration],
      ["InlineCode", markDecoration],
      ["HTMLTag", markDecoration],
      ["URL", markDecoration],
      ["HeaderMark", markDecoration],
      ["HeaderGap", markDecoration],
      ["QuoteMark", markDecoration],
      ["ListMark", markDecoration],
      ["LinkMark", markDecoration],
      ["EmphasisMark", markDecoration],
      ["CodeMark", markDecoration],
      ["CodeInfo", markDecoration],
      ["LinkTitle", markDecoration],
      ["LinkLabel", markDecoration]
    ] as [string, DecorationFn][]
  ).reduce(makeDecorations, {})
};

const ACTIVE_NODE_DECORATION = (
  [
    ["FencedCode", activeMarkDecoration],
    ["ATXHeading1", activeMarkDecoration],
    ["ATXHeading2", activeMarkDecoration],
    ["ATXHeading3", activeMarkDecoration],
    ["ATXHeading4", activeMarkDecoration],
    ["ATXHeading5", activeMarkDecoration],
    ["ATXHeading6", activeMarkDecoration],
    ["SetextHeading1", activeMarkDecoration],
    ["SetextHeading2", activeMarkDecoration],
    ["Emphasis", activeMarkDecoration],
    ["StrongEmphasis", activeMarkDecoration],
    ["InlineCode", activeMarkDecoration]
  ] as [string, DecorationFn][]
).reduce(makeDecorations, {});

export const ACTIVE_NODE_TYPE_NAMES = Object.keys(ACTIVE_NODE_DECORATION);

export const getLineTypeDecoration = (type: string): Decoration => {
  const decoration = DECORATION.line[type];
  if (decoration) {
    return decoration;
  } else {
    throw new Error(`Missing line decoration for type: ${type}`);
  }
};

export const getNodeTypeDecoration = (
  type: string,
  isActive: boolean
): Decoration => {
  let decoration = isActive
    ? ACTIVE_NODE_DECORATION[type]
    : DECORATION.node[type];
  if (!decoration) {
    decoration = DECORATION.node[type];
  }

  if (decoration) {
    return decoration;
  } else {
    throw new Error(`Missing node decoration for type: ${type}`);
  }
};
