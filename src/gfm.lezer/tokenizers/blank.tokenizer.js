import { readCurrentLine } from "../utils";

const BLANK_LINE_REGEXP = new RegExp("^\\s+$", "i");

const tokenizer = (input, token) => {
  const line = readCurrentLine(input, token.start);
  const lineMatch = line.match(BLANK_LINE_REGEXP);

  if (lineMatch) {
    return { term: "blank", end: token.start + lineMatch[0].length };
  }
};

export default tokenizer;
