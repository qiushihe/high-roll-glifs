import flow from "lodash/fp/flow";
import trim from "lodash/fp/trim";
import isEmpty from "lodash/fp/isEmpty";
import isNil from "lodash/fp/isNil";
import last from "lodash/fp/last";

const FENCED_CODE_FENCE_REGEXP = new RegExp(
  "^(\\s{0,3})(((`{3,})(\\s*[^`]*\\s*))|((~{3,})(\\s*[^~]*\\s*)))$",
  "i"
);

const FENCED_CODE_LINE_REGEXP = new RegExp("^.*$", "i");

const parse = (adaptedLine, state) => {
  let inProgressFencedCode = null;

  const previousLine = last(state.previousLines);

  if (previousLine) {
    const { type: previousLineType } = previousLine;

    if (previousLineType === "fenced-code-line") {
      const { fencedCode } = previousLine;
      inProgressFencedCode = fencedCode;
    }
  }

  const fenceMatch = adaptedLine.match(FENCED_CODE_FENCE_REGEXP);

  // If the current line matches a fence ...
  if (fenceMatch) {
    const fenceCharacter = (fenceMatch[4] || fenceMatch[7])[0];
    const infoString = fenceMatch[5] || fenceMatch[8];

    // ... and we're already in a code block ...
    if (!isNil(inProgressFencedCode)) {
      const couldBeEnd = flow([trim, isEmpty])(infoString);

      // ... and the fence we just matched could be an end fence ...
      if (couldBeEnd) {
        const { fence: inProgressFence } = inProgressFencedCode;

        // ... and it is an end fence for the in progress code block ...
        if (fenceCharacter === inProgressFence) {
          // ... then end the in progress code block.
          return {
            lineType: "fenced-code-line",
            lineContext: {
              raw: fenceMatch[0],
              fencedCode: {
                ...inProgressFencedCode,
                isContinuable: false
              }
            }
          };
        }
        // ... but it's not an end fence for the in progress code block ...
        else {
          // ... then continue the in progress code block.
          return {
            lineType: "fenced-code-line",
            lineContext: {
              raw: fenceMatch[0],
              fencedCode: {
                ...inProgressFencedCode,
                isContinuable: true
              }
            }
          };
        }
      }
      // ... but the fence we just matched could not be an end fence ...
      else {
        // ... then continue the in progress code block.
        return {
          lineType: "fenced-code-line",
          lineContext: {
            raw: fenceMatch[0],
            fencedCode: {
              ...inProgressFencedCode,
              isContinuable: true
            }
          }
        };
      }
    }
    // ... but we're not already in a code block ...
    else {
      // ... then start a code block.
      return {
        lineType: "fenced-code-line",
        lineContext: {
          raw: fenceMatch[0],
          fencedCode: {
            info: infoString,
            fence: fenceCharacter,
            isContinuable: true
          }
        }
      };
    }
  } else {
    // If:
    // * The current doesn't match a fence; AND ...
    // * We are inside a fenced code block; AND ...
    if (!isNil(inProgressFencedCode)) {
      const { isContinuable } = inProgressFencedCode;

      // * The fenced code block has not ended ...
      if (isContinuable) {
        // ... then consume any other line for the in-progress fenced code block.
        const lineMatch = adaptedLine.match(FENCED_CODE_LINE_REGEXP);

        return {
          lineType: "fenced-code-line",
          lineContext: {
            raw: lineMatch[0],
            fencedCode: inProgressFencedCode
          }
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
};

export default { name: "fenced-code", parse };
