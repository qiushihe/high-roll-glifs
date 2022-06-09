import { SyntaxNode } from "@lezer/common";
import { EditorState } from "@codemirror/state";

import { findChildNodeByType, getNodeText, isNodeInRanges } from "./node";
import { NumericRange, GraduatedDecorationRange } from "./range";

import {
  ACTIVE_NODE_TYPE_NAMES,
  nodeDecorator,
  gapDecorator,
  linkDecorator,
  getNodeTypeDecoration,
  getLinkWidgetDecoration
} from "./decoration";

export const getGraduatedDecorationRanges = (
  depth = 0,
  state: EditorState,
  node: SyntaxNode,
  selectionRanges: NumericRange[],
  decoratedRanges: Record<string, string[]>
): GraduatedDecorationRange[] => {
  const ranges: GraduatedDecorationRange[] = [];

  if (node.from !== node.to) {
    const nodeRangeKey = `${node.from}:${node.to}`;
    decoratedRanges[nodeRangeKey] = decoratedRanges[nodeRangeKey] || [];

    if (!decoratedRanges[nodeRangeKey].includes(node.type.name)) {
      const isActive =
        isNodeInRanges(node, selectionRanges) &&
        ACTIVE_NODE_TYPE_NAMES.includes(node.type.name);

      // TODO: Refactor these to be injectable into this function in a more
      //       formal manner
      if (node.type.name === "Link") {
        // TODO: Support link title
        // TODO: Support link with only URL
        // TODO: Support reference link

        const url = getNodeText(findChildNodeByType(node, "URL"), state);

        ranges.push({
          decorationRange: getNodeTypeDecoration(
            node.type.name,
            linkDecorator,
            {
              isActive,
              href: url
            }
          ).range(node.from, node.to),
          depth
        });

        ranges.push({
          decorationRange: getLinkWidgetDecoration(url).range(node.to),
          depth
        });
      } else {
        ranges.push({
          decorationRange: getNodeTypeDecoration(
            node.type.name,
            nodeDecorator,
            {
              isActive
            }
          ).range(node.from, node.to),
          depth
        });
      }

      decoratedRanges[nodeRangeKey].push(node.type.name);

      // TODO: Refactor these to be injectable into this function in a more
      //       formal manner
      if (
        node.type.name === "HeaderMark" &&
        node.parent?.type.name.match(/^ATXHeading/)
      ) {
        const gapMatch = state.doc
          .sliceString(node.parent.from, node.parent.to)
          .match(/^#+(\s+)/);

        const gapRangeKey = `${node.to}:${node.to + gapMatch[1].length}`;
        decoratedRanges[gapRangeKey] = decoratedRanges[gapRangeKey] || [];

        if (!decoratedRanges[gapRangeKey].includes("HeaderGap")) {
          ranges.push({
            decorationRange: getNodeTypeDecoration("HeaderGap", gapDecorator, {
              isActive: false
            }).range(node.to, node.to + gapMatch[1].length),
            depth
          });
          decoratedRanges[gapRangeKey].push("HeaderGap");
        }
      } else if (node.type.name === "QuoteMark") {
        // TODO: Scan paragraph inside blockquote to mark whitespace after a
        //       newline character as gap as well.

        let gapOffset = 0;
        while (true) {
          const gapStr = state.doc.sliceString(node.to, node.to + gapOffset);
          if (gapStr.length > 0 && gapStr.substr(gapStr.length - 1) !== " ") {
            break;
          }
          gapOffset++;
        }

        const gapLength = gapOffset - 1;

        if (gapLength > 0) {
          const gapRangeKey = `${node.to}:${node.to + gapLength}`;
          decoratedRanges[gapRangeKey] = decoratedRanges[gapRangeKey] || [];

          if (!decoratedRanges[gapRangeKey].includes("QuoteGap")) {
            ranges.push({
              decorationRange: getNodeTypeDecoration("QuoteGap", gapDecorator, {
                isActive: false
              }).range(node.to, node.to + gapLength),
              depth: depth + 1
            });
            decoratedRanges[gapRangeKey].push("QuoteGap");
          }
        }
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
