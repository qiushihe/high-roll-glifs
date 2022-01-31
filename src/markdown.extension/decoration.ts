import { Decoration } from "@codemirror/view";

const DECORATION = {
  active: {
    line: Decoration.line({
      attributes: { class: "hrg-line-Active" }
    }),
    node: Decoration.mark({
      attributes: { class: "hrg-node-Active" }
    })
  },
  line: [
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
    "Paragraph"
  ].reduce(
    (acc, type) => ({
      ...acc,
      [type]: Decoration.line({
        attributes: { class: `hrg-line-${type}` }
      })
    }),
    {}
  ),
  node: [
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
    "Paragraph",
    "Emphasis",
    "StrongEmphasis",
    "Link",
    "Image",
    "InlineCode",
    "HTMLTag",
    "URL",
    "HeaderMark",
    "QuoteMark",
    "ListMark",
    "LinkMark",
    "EmphasisMark",
    "CodeMark",
    "CodeInfo",
    "LinkTitle",
    "LinkLabel"
  ].reduce(
    (acc, type) => ({
      ...acc,
      [type]: Decoration.mark({
        attributes: { class: `hrg-${type}` }
      })
    }),
    {}
  )
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
