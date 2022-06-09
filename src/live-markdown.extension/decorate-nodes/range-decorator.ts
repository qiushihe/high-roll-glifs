import { SyntaxNode } from "@lezer/common";
import { EditorState } from "@codemirror/state";

import { findChildNodeByType, getNodeText, isNodeInRanges } from "./util/node";
import { NumericRange, GraduatedDecorationRange } from "./util/range";

import {
  ACTIVE_NODE_TYPE_NAMES,
  nodeDecorator,
  gapDecorator,
  linkDecorator,
  getNodeTypeDecoration,
  getLinkWidgetDecoration
} from "./node-decorator";

type RangeDecoratorContext = {
  depth: number;
  state: EditorState;
  isActive: () => boolean;
  isDecorated: (rangeKey: string, rangeTypeName: string) => boolean;
};

type RangeDecorator = (
  node: SyntaxNode,
  context: RangeDecoratorContext
) => {
  rangeKey: string;
  rangeTypeName: string;
  decorationRanges: GraduatedDecorationRange[];
} | null;

const decorateNodeRange: RangeDecorator = (node, context) => {
  const nodeRangeKey = `${node.from}:${node.to}`;

  if (!context.isDecorated(nodeRangeKey, node.type.name)) {
    return {
      rangeKey: nodeRangeKey,
      rangeTypeName: node.type.name,
      decorationRanges: [
        {
          decorationRange: getNodeTypeDecoration(
            node.type.name,
            nodeDecorator,
            {
              isActive: context.isActive()
            }
          ).range(node.from, node.to),
          depth: context.depth
        }
      ]
    };
  } else {
    return null;
  }
};

const decorateLinkRange: RangeDecorator = (node, context) => {
  // TODO: Support link title
  // TODO: Support link with only URL
  // TODO: Support reference link

  const nodeRangeKey = `${node.from}:${node.to}`;

  if (
    node.type.name === "Link" &&
    !context.isDecorated(nodeRangeKey, node.type.name)
  ) {
    const url = getNodeText(findChildNodeByType(node, "URL"), context.state);

    return {
      rangeKey: nodeRangeKey,
      rangeTypeName: node.type.name,
      decorationRanges: [
        {
          decorationRange: getNodeTypeDecoration(
            node.type.name,
            linkDecorator,
            {
              isActive: context.isActive(),
              href: url
            }
          ).range(node.from, node.to),
          depth: context.depth
        },
        {
          decorationRange: getLinkWidgetDecoration(url).range(node.to),
          depth: context.depth
        }
      ]
    };
  } else {
    return null;
  }
};

const decorateHeaderMarkRange: RangeDecorator = (node, context) => {
  if (
    node.type.name === "HeaderMark" &&
    node.parent?.type.name.match(/^ATXHeading/)
  ) {
    const gapMatch = context.state.doc
      .sliceString(node.parent.from, node.parent.to)
      .match(/^#+(\s+)/);

    const gapRangeKey = `${node.to}:${node.to + gapMatch[1].length}`;

    if (!context.isDecorated(gapRangeKey, "HeaderGap")) {
      return {
        rangeKey: gapRangeKey,
        rangeTypeName: "HeaderGap",
        decorationRanges: [
          {
            decorationRange: getNodeTypeDecoration("HeaderGap", gapDecorator, {
              isActive: false
            }).range(node.to, node.to + gapMatch[1].length),
            depth: context.depth
          }
        ]
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const decorateQuoteMarkRange: RangeDecorator = (node, context) => {
  // TODO: Scan paragraph inside blockquote to mark whitespace after a
  //       newline character as gap as well.

  if (node.type.name === "QuoteMark") {
    let gapOffset = 0;
    while (true) {
      const gapStr = context.state.doc.sliceString(
        node.to,
        node.to + gapOffset
      );
      if (gapStr.length > 0 && gapStr.substr(gapStr.length - 1) !== " ") {
        break;
      }
      gapOffset++;
    }

    const gapLength = gapOffset - 1;

    if (gapLength > 0) {
      const gapRangeKey = `${node.to}:${node.to + gapLength}`;

      if (!context.isDecorated(gapRangeKey, "QuoteGap")) {
        return {
          rangeKey: gapRangeKey,
          rangeTypeName: "QuoteGap",
          decorationRanges: [
            {
              decorationRange: getNodeTypeDecoration("QuoteGap", gapDecorator, {
                isActive: false
              }).range(node.to, node.to + gapLength),
              depth: context.depth + 1
            }
          ]
        };
      }
    }
  }
  return null;
};

const RANGE_DECORATORS: RangeDecorator[] = [
  decorateLinkRange,
  decorateNodeRange,
  decorateHeaderMarkRange,
  decorateQuoteMarkRange
];

export const getGraduatedDecorationRanges = (
  depth = 0,
  state: EditorState,
  node: SyntaxNode,
  selectionRanges: NumericRange[],
  decoratedRanges: Record<string, string[]>
): GraduatedDecorationRange[] => {
  const ranges: GraduatedDecorationRange[] = [];

  if (node.from !== node.to) {
    const rangeDecoratorContext: RangeDecoratorContext = {
      depth,
      state,
      isActive: () =>
        isNodeInRanges(node, selectionRanges) &&
        ACTIVE_NODE_TYPE_NAMES.includes(node.type.name),
      isDecorated: (rangeKey, rangeTypeName) =>
        (decoratedRanges[rangeKey] || []).includes(rangeTypeName)
    };

    for (
      let rangeDecoratorIndex = 0;
      rangeDecoratorIndex < RANGE_DECORATORS.length;
      rangeDecoratorIndex++
    ) {
      const rangeDecoratorResult = RANGE_DECORATORS[rangeDecoratorIndex](
        node,
        rangeDecoratorContext
      );

      if (rangeDecoratorResult !== null) {
        const { rangeKey, rangeTypeName, decorationRanges } =
          rangeDecoratorResult;

        decorationRanges.forEach((decorationRange) =>
          ranges.push(decorationRange)
        );

        decoratedRanges[rangeKey] = decoratedRanges[rangeKey] || [];
        decoratedRanges[rangeKey].push(rangeTypeName);
      }
    }
  }

  const cursor = node.cursor();

  if (cursor.firstChild()) {
    while (true) {
      getGraduatedDecorationRanges(
        depth + 1,
        state,
        cursor.node,
        selectionRanges,
        decoratedRanges
      ).forEach((childDecorationRange) => {
        ranges.push(childDecorationRange);
      });

      if (!cursor.nextSibling()) {
        break;
      }
    }
  }

  return ranges;
};
