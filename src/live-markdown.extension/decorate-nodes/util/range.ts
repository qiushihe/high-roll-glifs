import { Range } from "@codemirror/state";
import { Decoration } from "@codemirror/view";

export type NumericRange = { from: number; to: number };

export type GraduatedDecorationRange = {
  decorationRange: Range<Decoration>;
  depth: number;
};

export const sortedNumericRange = (from: number, to: number): NumericRange => {
  return from > to ? { from: to, to: from } : { from, to };
};
