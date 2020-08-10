import { LineOracle } from "../line.oracle";

interface AtxHeading {
  prefix: string;
  level: string;
  space: string;
  text: string;
  suffix: string;
}

const LINE_REGEXP = new RegExp(
  "^(\\s{0,3})(#{1,6})((\\s)(.*?))?(\\s+#+\\s*)?$",
  "i"
);

const parse = (line: string, unusedOracle?: LineOracle): AtxHeading | null => {
  const lineMatch = line.match(LINE_REGEXP);

  if (lineMatch) {
    return {
      prefix: lineMatch[1] || "",
      level: lineMatch[2] || "",
      space: lineMatch[4] || "",
      text: lineMatch[5] || "",
      suffix: lineMatch[6] || ""
    };
  } else {
    return null;
  }
};

export default { name: "atx-heading", parse };
