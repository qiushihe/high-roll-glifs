import flow from "lodash/fp/flow";
import cond from "lodash/fp/cond";
import negate from "lodash/fp/negate";
import isEmpty from "lodash/fp/isEmpty";
import constant from "lodash/fp/constant";
import join from "lodash/fp/join";
import stubTrue from "lodash/fp/stubTrue";
import trim from "lodash/fp/trim";

import { parseBlock } from "/src/gfm.parser/block.parser";
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
    // this `parseBlock` call could return is `empty-line`. It is possible for other types to be
    // returns. For example, during the parsing of fenced code blocks, "empty line" inside the
    // fenced code block is considered to be part of the code block.

    // Use `adaptString` to create a "fake"-ish adapted stream for the empty string so the block
    // parser can function as normal.
    const { lineType, lineContext } = parseBlock(adaptString(""), state);
    // console.log(lineType, lineContext);

    // Save line in state
    state.previousLines = [{ type: lineType, ...lineContext }];

    // Apply block level style
    return `line-background-${lineType}`;
  };

  const parseToken = (stream, state) => {
    const styles = [];

    // We only ever want to parse 1 whole line at a time (since our parser is written
    // this way), so only do anything at all if we're at the beginning of a line.
    if (stream.sol()) {
      const { lineType, lineContext, lineTokens } = parseBlock(
        adaptStream(stream),
        state
      );

      // console.log(lineType, lineContext, lineTokens);

      if (lineType && lineContext) {
        // Save line in state
        state.previousLines = [{ type: lineType, ...lineContext }];

        // Apply block level style
        styles.push(`line-background-${lineType}`);

        // Split inline tokens into "first one" (i.e. inline tokens for ths first/current
        // character) and "rest" to be processed later.
        const [firstInlineToken, ...restInlineTokens] = lineTokens;

        // Apply inline tokens (if any) to the current character.
        // TODO: Combine identical set of inline tokens for consecutive characters
        const inlineTokenString = join(" ")(firstInlineToken);
        if (flow([trim, negate(isEmpty)])(inlineTokenString)) {
          styles.push(inlineTokenString);
        }

        // Consume the current character
        stream.next();

        // Save the remaining inline tokens
        state.remainingInlineTokens = restInlineTokens;
      } else {
        stream.next();
      }
    } else {
      if (!isEmpty(state.remainingInlineTokens)) {
        const [
          firstInlineToken,
          ...restInlineTokens
        ] = state.remainingInlineTokens;
        const inlineTokenString = join(" ")(firstInlineToken);
        if (flow([trim, negate(isEmpty)])(inlineTokenString)) {
          styles.push(inlineTokenString);
        }
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
