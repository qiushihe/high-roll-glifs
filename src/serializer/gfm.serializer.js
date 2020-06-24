import flow from "lodash/fp/flow";
import map from "lodash/fp/map";
import trim from "lodash/fp/trim";
import flattenDeep from "lodash/fp/flattenDeep";
import isEmpty from "lodash/fp/isEmpty";

import markdownLineBuilder from "/src/serializer/markdown-line.builder";
import inlineStyleBuilder from "/src/serializer/inline-style.builder";

const withPrefix = prefix => token => {
  const { type: tokenType } = token;

  if (tokenType === "blank-line") {
    const { text: tokenText } = token;

    if (flow([trim, isEmpty])(prefix)) {
      return {
        ...token,
        text: `${prefix}${tokenText}`
      };
    } else {
      return {
        ...token,
        type: "paragraph",
        lines: [`${prefix}${tokenText}`]
      };
    }
  } else if (tokenType === "paragraph") {
    const { lines: tokenLines } = token;
    return {
      ...token,
      lines: map(tokenLine => `${prefix}${tokenLine}`)(tokenLines)
    };
  } else if (tokenType === "atx-heading") {
    return {
      ...token,
      prefix
    };
  } else {
    return token;
  }
};

const gfmSerializer = tokens => {
  const serializer = {};

  serializer.serialize = () => {
    return flow([
      map(token => {
        const { type: tokenType } = token;

        if (tokenType === "blank-line") {
          const { text } = token;
          return markdownLineBuilder()
            .text(text)
            .build();
        } else if (tokenType === "paragraph") {
          const { lines } = token;
          const lineText = lines.join("\n");

          const bulider = markdownLineBuilder();
          bulider.text(lineText);

          if (lineText === "dummy") {
            bulider.inlineStyle(
              inlineStyleBuilder()
                .offset(1)
                .length(1)
                .style("DUMMY")
                .build()
            );
          }

          return bulider.build();
        } else if (tokenType === "atx-heading") {
          const {
            level: tokenLevel,
            prefix: tokenPrefix,
            suffix: tokenSuffix,
            text: tokenText
          } = token;

          const blockText = [
            tokenPrefix,
            Array(tokenLevel + 1).join("#"),
            " ",
            tokenText,
            tokenSuffix
          ].join("");

          return markdownLineBuilder()
            .text(blockText)
            .build();
        } else if (tokenType === "settext-heading") {
          const {
            lines,
            underline: {
              prefix: underlinePrefix,
              text: underlineText,
              suffix: underlineSuffix
            }
          } = token;

          const headingLines = map(
            ({ prefix: linePrefix, text: lineText, suffix: lineSuffix }) =>
              [linePrefix, lineText, lineSuffix].join("")
          )(lines);

          const headingUnderline = [
            underlinePrefix,
            underlineText,
            underlineSuffix
          ].join("");

          return [
            ...map(lineText =>
              markdownLineBuilder()
                .text(lineText)
                .build()
            )(headingLines),
            markdownLineBuilder()
              .text(headingUnderline)
              .build()
          ];
        } else if (tokenType === "thematic-break") {
          const {
            prefix: tokenPrefix,
            suffix: tokenSuffix,
            text: tokenText
          } = token;

          const blockText = [tokenPrefix, tokenText, tokenSuffix].join("");

          return markdownLineBuilder()
            .text(blockText)
            .build();
        } else if (tokenType === "block-quote") {
          const { tokens: quotedTokens } = token;

          return map(([prefix, token]) =>
            flow([
              withPrefix(prefix),
              prefixedToken => gfmSerializer([prefixedToken]).serialize()
            ])(token)
          )(quotedTokens);
        } else {
          throw new Error(`unknown token type: ${tokenType}`);
        }
      }),
      flattenDeep
    ])(tokens);
  };

  return serializer;
};

export default gfmSerializer;
