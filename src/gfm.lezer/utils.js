const readUntilBefore = (endCharacter, delta) => (stream, startPosition) => {
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

export const readCurrentLine = (stream, startPosition) =>
  `${readUntilBefore("\n", -1)(stream, startPosition - 1)}${readUntilBefore(
    "\n",
    1
  )(stream, startPosition)}`;

export const getIndexOnCurrentLine = (stream, startPosition) => {
  return readUntilBefore("\n", -1)(stream, startPosition - 1).length;
};

export const readLinesAhead = (stream, startPosition, count) => {
  let linesRemaining = count;
  let line = readUntilBefore("\n", 1)(stream, startPosition);

  while (linesRemaining > 0) {
    line = readUntilBefore("\n", 1)(stream, startPosition + line.length + 1);
    linesRemaining -= 1;
  }

  return line;
};
