import { readCurrentLine } from "../utils";

const PARAGRAPH_LINE_REGEXP = new RegExp("^(\\s*[^\\s]+\\s*)+$", "i");

const tokenizer = (input, token) => {
  const line = readCurrentLine(input, token.start);
  const lineMatch = line.match(PARAGRAPH_LINE_REGEXP);

  if (lineMatch) {
    return { term: "ParagraphText", end: token.start + lineMatch[0].length };
  }
};

export default tokenizer;
