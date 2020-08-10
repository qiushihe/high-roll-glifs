import { LineOracle } from "../line.oracle";

interface ThematicBreak {
  prefix: string;
  text: string;
  suffix: string;
}

const LINE_REGEXP = new RegExp(
  "^(\\s{0,3})((-\\s*?){3,}|(_\\s*?){3,}|(\\*\\s*?){3,})(\\s*)$",
  "i"
);

const parse = (
  line: string,
  unusedOracle?: LineOracle
): ThematicBreak | null => {
  const lineMatch = line.match(LINE_REGEXP);

  if (lineMatch) {
    return {
      prefix: lineMatch[1] || "",
      text: lineMatch[2] || "",
      suffix: lineMatch[6] || ""
    };
  } else {
    return null;
  }
};

export default { name: "thematic-break", parse };
