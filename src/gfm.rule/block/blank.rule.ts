import { LineOracle } from "../line.oracle";

interface Blank {
  text: string;
}

const LINE_REGEXP = new RegExp("^\\s+$", "i");

const parse = (line: string, unusedOracle?: LineOracle): Blank | null => {
  const lineMatch = line.match(LINE_REGEXP);

  if (lineMatch) {
    return {
      text: lineMatch[0] || ""
    };
  } else {
    return null;
  }
};

export default { name: "blank", parse };
