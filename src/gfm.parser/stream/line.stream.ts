import { Stream } from "../type";

export default (lines: string[]): Stream => {
  let lineIndex = 0;

  const index = (): number => lineIndex;

  const position = (): number => {
    const lengthBefore = lines.slice(0, lineIndex).join("\n").length;
    return lengthBefore <= 0 ? 0 : lengthBefore + 1;
  };

  const text = (): string | null => lines[lineIndex];

  const next = () => {
    lineIndex += 1;
  };

  const ended = (): boolean => lineIndex >= lines.length;

  const match = (regexp: RegExp): RegExpMatchArray | null => {
    const line = text();
    return line === null || line === undefined ? null : line.match(regexp);
  };

  const lookAhead = (offset: number): string | null =>
    lines[lineIndex + offset];

  return { index, position, text, next, ended, match, lookAhead };
};
