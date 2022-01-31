/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import FullDoc from "!!raw-loader!./full-doc.md";
// @ts-ignore
import ExtremelyLargeDoc from "!!raw-loader!./extremely-large-doc.md";
// @ts-ignore
import Headers from "!!raw-loader!./headers.md";
// @ts-ignore
import BlockQuotes from "!!raw-loader!./block-quotes.md";
// @ts-ignore
import InlineCodeSpan from "!!raw-loader!./inline-code-span.md";
// @ts-ignore
import InlineStyles from "!!raw-loader!./inline-styles.md";
// @ts-ignore
import Lists from "!!raw-loader!./lists.md";
// @ts-ignore
import NestedLazyParagraphs from "!!raw-loader!./nested-lazy-paragraphs.md";
// @ts-ignore
import ThematicBreak from "!!raw-loader!./thematic-break.md";
/* eslint-enable @typescript-eslint/ban-ts-comment */

const TEST_DOC: Record<string, string> = {
  FullDoc,
  ExtremelyLargeDoc,
  Headers,
  BlockQuotes,
  InlineCodeSpan,
  InlineStyles,
  Lists,
  NestedLazyParagraphs,
  ThematicBreak
};

export const getTestDocNames = (): string[] => {
  return Object.keys(TEST_DOC);
};

export const getTestDocByName = (name: string): string => {
  return TEST_DOC[name];
};
