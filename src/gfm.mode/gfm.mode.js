import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import size from "lodash/fp/size";
import cond from "lodash/fp/cond";
import negate from "lodash/fp/negate";
import isEmpty from "lodash/fp/isEmpty";
import constant from "lodash/fp/constant";
import join from "lodash/fp/join";
import stubTrue from "lodash/fp/stubTrue";
import trim from "lodash/fp/trim";
import times from "lodash/fp/times";

import { parse as gfmParse } from "/src/gfm.parser";
import { adaptStream, adaptString } from "/src/gfm.parser/line.adapter";

// See https://codemirror.net/doc/manual.html#modeapi for docs
// See https://codemirror.net/mode/clike/clike.js for example

export default () => {
  const getParserInitialState = () => ({
    previousLines: []
  });

  const parseEmptyLine = state => {
    // CodeMirror's "blank line" definition is not the same as GFM's definition. For CodeMirror,
    // a "blank link" is only a line with zero length, however for GFM, a "blank link" is any line
    // that contains only whitespace characters.

    // It is important to note that it's not necessarily the case that the only `lineType` that
    // this `gfmParse` call could return is `empty-line`. It is possible for other types to be
    // returns. For example, during the parsing of fenced code blocks, "empty line" inside the
    // fenced code block is considered to be part of the code block.

    // Use `adaptString` to create a "fake"-ish adapted stream for the empty string so the block
    // parser can function as normal.
    const { lineType, lineContext, inlineTokens, inlineContext } = gfmParse(
      adaptString(""),
      state
    );
    // console.log(lineType, lineContext);

    // Save previous line state
    state.previousLines = [
      {
        type: lineType,
        context: lineContext,
        inline: { tokens: inlineTokens, context: inlineContext }
      }
    ];

    // Apply block level style
    // IMPORTANT: DO NOT USE the `line-background-` prefix because otherwise it will cause an
    //            extra `CodeMirror-linebackground` div to be inserted into the DOM and that
    //            in turn causes the "backspace" key (and probably other things related to
    //            keyboard events) to not work in Chrome on Android.
    //            For more enlightening experience of reason and sensibleness, see this thread:
    //            - https://bugs.chromium.org/p/chromium/issues/detail?id=118639
    return `line-${lineType}`;
  };

  const parseToken = (stream, state) => {
    const styles = [];

    // We only ever want to parse 1 whole line at a time (since our parser is written
    // this way), so only do anything at all if we're at the beginning of a line.
    if (stream.sol()) {
      const { lineType, lineContext, inlineTokens, inlineContext } = gfmParse(
        adaptStream(stream),
        state
      );

      // console.log(lineType, lineContext, inlineTokens);

      if (lineType && lineContext) {
        // Save previous line state
        state.previousLines = [
          {
            type: lineType,
            context: lineContext,
            inline: { tokens: inlineTokens, context: inlineContext }
          }
        ];

        // Apply block level style
        // IMPORTANT: DO NOT USE the `line-background-` prefix because otherwise it will cause an
        //            extra `CodeMirror-linebackground` div to be inserted into the DOM and that
        //            in turn causes the "backspace" key (and probably other things related to
        //            keyboard events) to not work in Chrome on Android.
        //            For more enlightening experience of reason and sensibleness, see this thread:
        //            - https://bugs.chromium.org/p/chromium/issues/detail?id=118639
        styles.push(`line-${lineType}`);

        // TODO: Combine identical set of inline tokens for consecutive characters

        // If inline tokens for the current line is not empty ...
        // (under normal circumstances this should always be true. Since `inlineTokens` is an array
        // of arrays -- each character of the line has an corresponding array of inline tokens for
        // that character -- even for lines without any actual inline tokens, this `inlineTokens`
        // array should still contain a number of empty arrays equal to the number of characters
        // on the line)
        if (!isEmpty(inlineTokens)) {
          // Split inline tokens into "first one" (i.e. inline tokens for ths first/current
          // character) and "rest" to be processed later.
          const [firstInlineToken, ...restInlineTokens] = inlineTokens;

          // Apply inline tokens (if any) to the current character.
          const inlineTokenString = join(" ")(firstInlineToken);
          if (flow([trim, negate(isEmpty)])(inlineTokenString)) {
            styles.push(inlineTokenString);
          }

          // Save the remaining inline tokens to be applied to subsequent characters.
          state.remainingInlineTokens = restInlineTokens;

          // Consume the current character.
          stream.next();
        }
        // ... or if the inline tokens for the current line is actually empty ...
        // (this should normally never happen)
        else {
          // ... then consume the whole rest of the current line.
          flow([get("raw"), size, times(() => stream.next())])(lineContext);
        }
      } else {
        stream.next();
      }
    } else {
      // If there are remaining inline tokens ...
      if (!isEmpty(state.remainingInlineTokens)) {
        const [
          firstInlineToken,
          ...restInlineTokens
        ] = state.remainingInlineTokens;

        // ... then apply inline tokens for the current character.
        const inlineTokenString = join(" ")(firstInlineToken);
        if (flow([trim, negate(isEmpty)])(inlineTokenString)) {
          styles.push(inlineTokenString);
        }

        // Save the remaining inline tokens to be applied to subsequent characters.
        state.remainingInlineTokens = restInlineTokens;
      }

      stream.next();
    }

    return cond([
      [isEmpty, constant(null)],
      [stubTrue, join(" ")]
    ])(styles);
  };

  return {
    name: "high-roll-glifs-gfm-lol",
    fn: () => ({
      startState: getParserInitialState,
      token: parseToken,
      blankLine: parseEmptyLine
    })
  };
};
