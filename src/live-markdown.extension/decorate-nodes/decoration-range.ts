import { SyntaxNode } from "@lezer/common";
import { EditorState } from "@codemirror/state";
import { Decoration } from "@codemirror/view";

import { findChildNodeByType, getNodeText, isNodeInRanges } from "./node";

import {
  ACTIVE_NODE_TYPE_NAMES,
  nodeDecorator,
  linkDecorator,
  getNodeTypeDecoration,
  getLinkWidgetDecoration
} from "./decoration";

import { NumericRange, GraduatedDecorationRange } from "./range";

export const getNodeDecorationRanges = (
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

      const decorations: [Decoration, [number, number] | [number]][] = [];

      // TODO: Refactor these to be injectable into this function in a more
      //       formal manner
      if (node.type.name === "Link") {
        // TODO: Support link title
        // TODO: Support link with only URL
        // TODO: Support reference link

        const url = getNodeText(findChildNodeByType(node, "URL"), state);

        decorations.push([
          getNodeTypeDecoration(node.type.name, linkDecorator, {
            isActive,
            href: url
          }),
          [node.from, node.to]
        ]);

        decorations.push([getLinkWidgetDecoration(url), [node.to]]);
      } else {
        decorations.push([
          getNodeTypeDecoration(node.type.name, nodeDecorator, {
            isActive
          }),
          [node.from, node.to]
        ]);
      }

      decorations.forEach(([decoration, range]) => {
        ranges.push({
          decorationRange: decoration.range(range[0], range[1]),
          depth
        });
      });

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
            decorationRange: getNodeTypeDecoration("HeaderGap", nodeDecorator, {
              isActive: false
            }).range(node.to, node.to + gapMatch[1].length),
            depth
          });
          decoratedRanges[gapRangeKey].push("HeaderGap");
        }
      } else if (
        node.type.name === "ListMark" &&
        node.parent?.type.name === "ListItem" &&
        (node.parent?.parent?.type.name === "BulletList" ||
          node.parent?.parent?.type.name === "OrderedList")
      ) {
        const markLength = state.doc.sliceString(node.from, node.to).length;
        const itemString = state.doc.sliceString(
          node.parent.from,
          node.parent.to
        );
        const gapLength = itemString.substr(markLength).match(/^\s+/)[0].length;

        const gapRangeKey = `${node.to}:${node.to + gapLength}`;
        decoratedRanges[gapRangeKey] = decoratedRanges[gapRangeKey] || [];

        if (!decoratedRanges[gapRangeKey].includes("ListMarkGap")) {
          ranges.push({
            decorationRange: getNodeTypeDecoration(
              "ListMarkGap",
              nodeDecorator,
              {
                isActive: false
              }
            ).range(node.to, node.to + gapLength),
            depth: depth
          });
          decoratedRanges[gapRangeKey].push("ListMarkGap");
        }

        if (node.parent?.parent?.type.name === "OrderedList") {
          // List marker can only ever be 1 character long
          const markerRangeKey = `${node.to - 1}:${node.to}`;
          decoratedRanges[markerRangeKey] =
            decoratedRanges[markerRangeKey] || [];

          if (!decoratedRanges[markerRangeKey].includes("ListMarker")) {
            ranges.push({
              decorationRange: getNodeTypeDecoration(
                "ListMarker",
                nodeDecorator,
                {
                  isActive: false
                }
              ).range(node.to - 1, node.to),
              depth: depth + 1
            });
            decoratedRanges[markerRangeKey].push("ListMarker");
          }
        }
      }
    }
  }

  const cursor = node.cursor();

  if (cursor.firstChild()) {
    while (true) {
      getNodeDecorationRanges(
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
