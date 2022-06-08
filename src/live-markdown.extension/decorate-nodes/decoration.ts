import { Decoration } from "@codemirror/view";

export const ACTIVE_NODE_CLASS_NAME = "hrg-ActiveNode";

export const ACTIVE_NODE_TYPE_NAMES = [
  "FencedCode",
  "ATXHeading1",
  "ATXHeading2",
  "ATXHeading3",
  "ATXHeading4",
  "ATXHeading5",
  "ATXHeading6",
  "SetextHeading1",
  "SetextHeading2",
  "Emphasis",
  "StrongEmphasis",
  "InlineCode",
  "Link"
];

const ALL_DECORATIONS: Record<string, Decoration> = {};

export const getLineTypeDecoration = (type: string): Decoration => {
  const key = `line-type||${type}`;

  if (!ALL_DECORATIONS[key]) {
    ALL_DECORATIONS[key] = Decoration.line({
      attributes: { class: `hrg-line-${type}` }
    });
  }

  return ALL_DECORATIONS[key];
};

export type NodeDecoratorOptions = {
  isActive: boolean;
};

export const nodeDecorator = (
  type: string,
  options: NodeDecoratorOptions
): Decoration => {
  return Decoration.mark({
    attributes: {
      class: `hrg-${type} ${options.isActive ? ACTIVE_NODE_CLASS_NAME : ""}`
    }
  });
};

export const linkDecorator = (
  type: string,
  options: NodeDecoratorOptions & { href: string }
): Decoration => {
  return Decoration.mark({
    tagName: "a",
    attributes: {
      class: `hrg-Link ${options.isActive ? ACTIVE_NODE_CLASS_NAME : ""}`,
      href: options.href,
      target: "_blank"
    }
  });
};

export const getNodeTypeDecoration = <TDecoratorOptions>(
  type: string,
  decorator: (type: string, opts: TDecoratorOptions) => Decoration,
  options: NodeDecoratorOptions & TDecoratorOptions
): Decoration => {
  const key = `node-type||${type}||${JSON.stringify(options)}`;

  if (!ALL_DECORATIONS[key]) {
    ALL_DECORATIONS[key] = decorator(type, options);
  }

  return ALL_DECORATIONS[key];
};
