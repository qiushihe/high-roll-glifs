import flow from "lodash/fp/flow";
import trim from "lodash/fp/trim";
import negate from "lodash/fp/negate";
import isEmpty from "lodash/fp/isEmpty";
import last from "lodash/fp/last";
import size from "lodash/fp/size";

const BULLET_LIST_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})([-+*])(\\s{0,4})(.*)$",
  "i"
);

const ORDERED_LIST_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})([0-9]{1,9})([.)])(\\s{0,4})(.*)$",
  "i"
);

const UNMARKED_LIST_LINE_REGEXP = new RegExp("^(\\s*)(.*)$", "i");

const parse = (adaptedLine, state) => {
  const bulletLineMatch = adaptedLine.match(BULLET_LIST_LINE_REGEXP);
  const orderedLineMatch = adaptedLine.match(ORDERED_LIST_LINE_REGEXP);

  if (bulletLineMatch) {
    const prefix = bulletLineMatch[1];
    const marker = bulletLineMatch[2];
    const midfix = bulletLineMatch[3];
    const content = bulletLineMatch[4];

    const leader = `${prefix}${marker}${midfix}`;

    if (size(midfix) <= 0) {
      if (flow([trim, isEmpty])(content)) {
        const previousLine = last(state.previousLines);

        if (previousLine) {
          const { type: previousLineType } = previousLine;

          if (previousLineType !== "settext-heading-line") {
            return {
              lineType: "bullet-list-line",
              lineContext: {
                raw: bulletLineMatch[0],
                list: {
                  type: "bullet",
                  leader: size(leader) + 1
                }
              }
            };
          } else {
            return null;
          }
        } else {
          return {
            lineType: "bullet-list-line",
            lineContext: {
              raw: bulletLineMatch[0],
              list: {
                type: "bullet",
                leader: size(leader) + 1
              }
            }
          };
        }
      } else {
        return null;
      }
    } else {
      return {
        lineType: "bullet-list-line",
        lineContext: {
          raw: bulletLineMatch[0],
          list: {
            type: "bullet",
            leader: size(leader)
          }
        }
      };
    }
  } else if (orderedLineMatch) {
    const prefix = orderedLineMatch[1];
    const digits = orderedLineMatch[2];
    const marker = orderedLineMatch[3];
    const midfix = orderedLineMatch[4];
    const content = orderedLineMatch[5];

    const leader = `${prefix}${digits}${marker}${midfix}`;
    const number = parseInt(digits, 10);

    if (size(midfix) <= 0) {
      if (flow([trim, isEmpty])(content)) {
        return {
          lineType: "ordered-list-line",
          lineContext: {
            raw: orderedLineMatch[0],
            list: {
              type: "ordered",
              leader: size(leader) + 1
            }
          }
        };
      } else {
        return null;
      }
    } else {
      if (number >= 0) {
        return {
          lineType: "ordered-list-line",
          lineContext: {
            raw: orderedLineMatch[0],
            list: {
              type: "ordered",
              leader: size(leader)
            }
          }
        };
      } else {
        return null;
      }
    }
  } else {
    const previousLine = last(state.previousLines);

    if (previousLine) {
      const { type: previousLineType } = previousLine;

      if (
        previousLineType === "bullet-list-line" ||
        previousLineType === "ordered-list-line"
      ) {
        const {
          context: { list: previousList }
        } = previousLine;
        const { leader: previousLeader } = previousList;

        const unmarkedLineMatch = adaptedLine.match(UNMARKED_LIST_LINE_REGEXP);
        const prefix = unmarkedLineMatch[1];
        const content = unmarkedLineMatch[2];

        if (size(prefix) >= previousLeader) {
          return {
            lineType: previousLineType,
            lineContext: {
              raw: unmarkedLineMatch[0],
              list: previousList
            }
          };
        } else {
          if (flow([trim, negate(isEmpty)])(content)) {
            return {
              lineType: previousLineType,
              lineContext: {
                raw: unmarkedLineMatch[0],
                list: previousList
              }
            };
          } else {
            return null;
          }
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
};

export default { name: "list", parse };
