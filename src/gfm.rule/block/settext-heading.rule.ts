import { LineOracle } from "../line.oracle";

interface SettextHeading {
  isUnderline: boolean;
  prefix: string;
  text: string;
  suffix: string;
}

const LINE_REGEXP = new RegExp("^(\\s{0,3})(([^\\s]\\s*?)+)(\\s*)$", "i");
const UNDERLINE_REGEXP = new RegExp("^(\\s{0,3})((-+)|(=+))(\\s*)$", "i");

const parse = (
  line: string,
  oracle?: LineOracle | null
): SettextHeading | null => {
  if (oracle) {
    const lineMatch = line.match(LINE_REGEXP);
    const underlineMatch = line.match(UNDERLINE_REGEXP);

    if (underlineMatch) {
      const previousLine = oracle.lineAtOffset(-1);

      if (previousLine && previousLine.match(LINE_REGEXP)) {
        return {
          isUnderline: true,
          prefix: underlineMatch[1] || "",
          text: underlineMatch[2] || "",
          suffix: underlineMatch[5] || ""
        };
      } else {
        return null;
      }
    } else if (lineMatch) {
      const nextLine = oracle.lineAtOffset(1);

      if (nextLine && nextLine.match(UNDERLINE_REGEXP)) {
        return {
          isUnderline: false,
          prefix: lineMatch[1] || "",
          text: lineMatch[2] || "",
          suffix: lineMatch[4] || ""
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default { name: "settext-heading", parse };
