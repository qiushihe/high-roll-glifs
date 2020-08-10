import { LineOracle } from "../line.oracle";

interface Paragraph {
  text: string;
}

const LINE_REGEXP = new RegExp("^(\\s*[^\\s]+\\s*)+$", "i");

const parse = (line: string, unusedOracle?: LineOracle): Paragraph | null => {
  const lineMatch = line.match(LINE_REGEXP);

  if (lineMatch) {
    return {
      text: lineMatch[0] || ""
    };
  } else {
    return null;
  }
};

export default { name: "paragraph", parse };
