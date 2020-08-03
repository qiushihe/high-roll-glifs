import flow from "lodash/fp/flow";
import size from "lodash/fp/size";
import isEmpty from "lodash/fp/isEmpty";
import isNil from "lodash/fp/isNil";
import reduce from "lodash/fp/reduce";
import get from "lodash/fp/get";
import first from "lodash/fp/first";
import includes from "lodash/fp/includes";

import { getFromMany } from "/src/util/function.util";

import {
  getInlineContext,
  getPreviousInlineContext
} from "/src/util/parser.util";

import { adaptString } from "../../line.adapter";
import { parseBlock } from "../../block.parser";

const parseCodeSpan = (text, line, state, stream) => {
  return reduce(
    ({ tokens, context }, character) => {
      if (character === "`") {
        if (context.inSpan) {
          if (context.onSameLine) {
            let sliceLength = size(tokens) - context.spanLength;
            if (sliceLength < 0) {
              sliceLength = 0;
            }

            return {
              tokens: [
                ...tokens.slice(0, sliceLength),
                ["code-span", "inline-syntax"],
                ...Array(context.spanLength - 1).fill(["code-span"]),
                ["code-span", "inline-syntax"]
              ],
              context: { ...context, inSpan: false, spanLength: 1 }
            };
          } else {
            let sliceLength = size(tokens) - context.spanLength;
            if (sliceLength < 0) {
              sliceLength = 0;
            }

            return {
              tokens: [
                ...tokens.slice(0, sliceLength),
                ...Array(context.spanLength).fill(["code-span"]),
                ["code-span", "inline-syntax"]
              ],
              context: { ...context, inSpan: false, spanLength: 0 }
            };
          }
        } else {
          return {
            tokens: [...tokens, []],
            context: {
              ...context,
              inSpan: true,
              spanLength: 1,
              onSameLine: true
            }
          };
        }
      } else {
        const isFirst = isEmpty(tokens);
        const isLast = size(tokens) >= size(text) - 1;

        if (context.inSpan) {
          if (isFirst) {
            return {
              tokens: [...tokens, []],
              context: {
                ...context,
                spanLength: (context.spanLength || 0) + 1,
                onSameLine: false
              }
            };
          } else if (isLast) {
            const lookAheadLines = context.lookAhead || 1;
            const nextLineText = stream.lookAhead(lookAheadLines);

            if (!isNil(nextLineText)) {
              const {
                lineType: nextLineType,
                lineContext: nextLineContext
              } = parseBlock(adaptString(nextLineText), {});

              if (nextLineType === "paragraph-line") {
                const nextLineResult = parseCodeSpan(
                  nextLineText,
                  {
                    type: nextLineType,
                    ...nextLineContext,
                    inline: {
                      tokens: Array(nextLineText.length).fill([]),
                      ...context,
                      lookAhead: lookAheadLines + 1
                    }
                  },
                  state,
                  stream
                );

                if (
                  flow([get("tokens"), first, includes("code-span")])(
                    nextLineResult
                  )
                ) {
                  let sliceLength = size(tokens) - context.spanLength;
                  if (sliceLength < 0) {
                    sliceLength = 0;
                  }

                  if (context.onSameLine) {
                    return {
                      tokens: [
                        ...tokens.slice(0, sliceLength),
                        ["code-span", "inline-syntax"],
                        ...Array(context.spanLength - 1).fill(["code-span"]),
                        ["code-span"]
                      ],
                      context: {
                        ...context,
                        spanLength: (context.spanLength || 0) + 1
                      }
                    };
                  } else {
                    return {
                      tokens: [
                        ...tokens.slice(0, sliceLength),
                        ...Array(context.spanLength).fill(["code-span"]),
                        ["code-span"]
                      ],
                      context: {
                        ...context,
                        spanLength: (context.spanLength || 0) + 1
                      }
                    };
                  }
                } else {
                  return {
                    tokens: [...tokens, []],
                    context: {
                      ...context,
                      spanLength: (context.spanLength || 0) + 1
                    }
                  };
                }
              } else {
                return {
                  tokens: [...tokens, []],
                  context: {
                    ...context,
                    spanLength: (context.spanLength || 0) + 1
                  }
                };
              }
            } else {
              return {
                tokens: [...tokens, []],
                context: {
                  ...context,
                  spanLength: (context.spanLength || 0) + 1
                }
              };
            }
          } else {
            return {
              tokens: [...tokens, []],
              context: { ...context, spanLength: (context.spanLength || 0) + 1 }
            };
          }
        } else {
          return {
            tokens: [...tokens, []],
            context
          };
        }
      }
    },
    {
      tokens: [],
      context: {
        inSpan: getFromMany("inSpan")(
          getInlineContext(line),
          getPreviousInlineContext(state)
        ),
        lookAhead: getFromMany("lookAhead")(
          getInlineContext(line),
          getPreviousInlineContext(state)
        )
      }
    }
  )(text);
};

const parse = (line, state, stream) => {
  const { type: lineType } = line;

  if (lineType === "atx-heading-line") {
    const {
      atxHeading: { level, text, prefix, suffix }
    } = line;

    const { tokens } = parseCodeSpan(text, line, state, stream);

    return {
      inlineTokens: [
        ...Array(size(prefix)).fill([]),
        ...Array(level).fill([]),
        [],
        ...tokens,
        ...Array(size(suffix)).fill([])
      ],

      // Do not persist inline context because ATX heading can not have lazy continuation text.
      inlineContext: {}
    };
  } else if (lineType === "paragraph-line") {
    const { raw } = line;
    const { tokens, context } = parseCodeSpan(raw, line, state, stream);

    return {
      inlineTokens: tokens,

      // Persist inline context so consecutive paragraph can share continuous code spans.
      inlineContext: context
    };
  } else {
    return null;
  }
};

export default { name: "code-span", parse };
