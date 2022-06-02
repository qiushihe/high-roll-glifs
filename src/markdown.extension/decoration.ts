import { Decoration } from "@codemirror/view";

type DecorationFn = (name: string) => Decoration;

const activeDecoration: DecorationFn = (name: string) => {
  if (name === "line") {
    return Decoration.line({
      attributes: { class: `hrg-${name}-Active` }
    });
  } else if (name === "node") {
    return Decoration.mark({
      attributes: { class: `hrg-${name}-Active` }
    });
  } else {
    throw new Error(`Unknown active decoration name: ${name}`);
  }
};

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

const makeDecorations = (acc, [name, decorationFn]) => ({
  ...acc,
  [name]: decorationFn(name)
});

const DECORATION = {
  active: (
    [
      ["line", activeDecoration],
      ["node", activeDecoration]
    ] as [string, DecorationFn][]
  ).reduce(makeDecorations, {}),
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

export const getActiveDecoration = (type: string): Decoration => {
  return DECORATION.active[type];
};

export const getLineTypeDecoration = (type: string): Decoration => {
  const decoration = DECORATION.line[type];
  if (decoration) {
    return decoration;
  } else {
    DECORATION.line[type] = Decoration.line({
      attributes: { class: `hrg-line-${type}` }
    });
    console.log(`[getLineTypeDecoration] Added missing decoration for ${type}`);
    return getLineTypeDecoration(type);
  }
};

export const getNodeTypeDecoration = (type: string): Decoration => {
  const decoration = DECORATION.node[type];
  if (decoration) {
    return decoration;
  } else {
    DECORATION.node[type] = Decoration.mark({
      attributes: { class: `hrg-${type}` }
    });
    console.log(`[getNodeTypeDecoration] Added missing decoration for ${type}`);
    return getNodeTypeDecoration(type);
  }
};
