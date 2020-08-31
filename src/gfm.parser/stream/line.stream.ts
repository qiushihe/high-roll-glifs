export interface LineStream {
  index: () => number;
  position: () => number;
  text: () => string | null;
  next: () => void;
  ended: () => boolean;
  match: (regexp: RegExp, UNUSED_consume: boolean) => RegExpMatchArray | null;
  slice: (from: number) => LineStream;
}

const lineStream = (lines: string[]): LineStream => {
  let lineIndex = 0;

  const index = (): number => lineIndex;

  const position = (): number => {
    const linesBefore = lines.slice(0, lineIndex);

    // If there is no line before the current line ...
    if (linesBefore.length <= 0) {
      // ... then the current line is the first line which means the stream's position is `0`.
      return 0;
    } else {
      // If there are lines before the current line, then the stream's position is the number
      // of characters before the current line plus `1`. The `+ 1` accounts for the linebreak
      // character immediately precedes the current line.
      return linesBefore.join("\n").length + 1;
    }
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

  const slice = (from: number): LineStream =>
    lineStream(lines.slice(lineIndex + from));

  return { index, position, text, next, ended, match, slice };
};

export default lineStream;
