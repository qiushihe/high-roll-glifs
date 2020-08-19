import flow from "lodash/fp/flow";
import trim from "lodash/fp/trim";
import negate from "lodash/fp/negate";
import isEmpty from "lodash/fp/isEmpty";
import last from "lodash/fp/last";
import size from "lodash/fp/size";

import { AdaptedStream } from "../../stream/adapter";
import { ParserState } from "../../parser";
import { ParseBlockRule, ParsedBlock } from "../../block.parser";

const BULLET_LIST_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})([-+*])(\\s{0,4})(.*)$",
  "i"
);

const ORDERED_LIST_LINE_REGEXP = new RegExp(
  "^(\\s{0,3})([0-9]{1,9})([.)])(\\s{0,4})(.*)$",
  "i"
);

const UNMARKED_LIST_LINE_REGEXP = new RegExp("^(\\s*)(.*)$", "i");

const parse: ParseBlockRule = (
  stream: AdaptedStream,
  state: ParserState
): ParsedBlock | null => {
  const bulletLineMatch = stream.match(BULLET_LIST_LINE_REGEXP);
  const orderedLineMatch = stream.match(ORDERED_LIST_LINE_REGEXP);

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
              },
              inlineTokens: []
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
            },
            inlineTokens: []
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
        },
        inlineTokens: []
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
          },
          inlineTokens: []
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
          },
          inlineTokens: []
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
        const unmarkedLineMatch = stream.match(UNMARKED_LIST_LINE_REGEXP);

        if (unmarkedLineMatch) {
          const prefix = unmarkedLineMatch[1];
          const content = unmarkedLineMatch[2];

          const {
            context: { list: previousList }
          } = previousLine;

          if (previousList) {
            const { leader: previousLeader } = previousList;

            if (size(prefix) >= previousLeader) {
              return {
                lineType: previousLineType,
                lineContext: {
                  raw: unmarkedLineMatch[0],
                  list: previousList
                },
                inlineTokens: []
              };
            } else {
              if (flow([trim, negate(isEmpty)])(content)) {
                return {
                  lineType: previousLineType,
                  lineContext: {
                    raw: unmarkedLineMatch[0],
                    list: previousList
                  },
                  inlineTokens: []
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
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
};

export default { name: "list", parse };
