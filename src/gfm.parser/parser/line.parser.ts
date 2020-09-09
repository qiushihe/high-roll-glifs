import uniq from "lodash/fp/uniq";

import { getRules as getLineRules } from "../rule/line/rule";
import { LineContext } from "./line";

export interface ParsedLine {
  type: string;
  context: LineContext;
}

export interface ParsedLines {
  getRaw: () => string;
  getTypes: () => string[];
  getLineByType: (name: string) => ParsedLine | null;
}

export type ParseLineRule = (raw: string) => ParsedLine[];

export type ParseLines = (raw: string) => ParsedLines;

export const parse: ParseLines = (raw: string): ParsedLines => {
  const rules = getLineRules();
  const lines: ParsedLine[] = [];

  for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
    const rule = rules[ruleIndex];
    const ruleLines = rule.parse(raw);

    if (ruleLines.length > 0) {
      lines.push(...ruleLines);
    }
  }

  const lineTypes: string[] = [];
  const lineByType: { [key: string]: ParsedLine } = {};

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    lineTypes.push(lines[lineIndex].type);
    lineByType[lines[lineIndex].type] = lines[lineIndex];
  }

  const getRaw = () => raw;

  const getTypes = (): string[] => {
    return uniq(lineTypes);
  };

  const getLineByType = (name: string): ParsedLine | null => {
    return lineByType[name];
  };

  return { getRaw, getTypes, getLineByType };
};
