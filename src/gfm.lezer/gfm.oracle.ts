import { InputStream } from "lezer";

import { GfmOracle } from "/src/gfm.rule/oracle.type";

const readUntilBefore = (endCharacter: string, delta: number) => (
  stream: InputStream,
  startPosition: number
): string => {
  const characters = [];
  let offset = 0;

  while (true) {
    const characterIndex = startPosition + offset;

    if (characterIndex < 0) {
      break;
    }

    const charCode = stream.get(characterIndex);
    if (charCode < 0) {
      break;
    } else {
      const character = String.fromCharCode(charCode);
      if (character === endCharacter) {
        break;
      } else {
        characters.push(String.fromCharCode(charCode));
        offset += delta;
      }
    }
  }

  if (delta < 0) {
    return characters.reverse().join("");
  } else {
    return characters.join("");
  }
};

const readLineAtOffset = (
  stream: InputStream,
  startPosition: number,
  count: number
): string => {
  const textBefore = readUntilBefore("\n", -1)(stream, startPosition - 1);
  const textAfter = readUntilBefore("\n", 1)(stream, startPosition);

  if (count > 0) {
    // The `+ 1` is for the `\n` potentially at the end of the current line.
    return readLineAtOffset(
      stream,
      startPosition + textAfter.length + 1,
      count - 1
    );
  } else if (count < 0) {
    // The `- 1` is for the `\n` potentially at the start of the current line.
    return readLineAtOffset(
      stream,
      startPosition - textBefore.length - 1,
      count + 1
    );
  } else {
    return `${textBefore}${textAfter}`;
  }
};

const getGfmOracle = (stream: InputStream, position: number): GfmOracle => ({
  getCurrentLine: () =>
    [
      readUntilBefore("\n", -1)(stream, position - 1),
      readUntilBefore("\n", 1)(stream, position)
    ].join(""),
  getIndexOnCurrentLine: () =>
    readUntilBefore("\n", -1)(stream, position - 1).length,
  getLineAtOffset: (offset: number) =>
    readLineAtOffset(stream, position, offset)
});

export default getGfmOracle;
