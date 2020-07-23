import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import size from "lodash/fp/size";
import cond from "lodash/fp/cond";
import isEmpty from "lodash/fp/isEmpty";
import constant from "lodash/fp/constant";
import join from "lodash/fp/join";
import stubTrue from "lodash/fp/stubTrue";
import times from "lodash/fp/times";

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
      const { lineType, lineContext } = parseBlock(adaptStream(stream), state);
      // console.log(lineType, lineContext);

      if (lineType && lineContext) {
        // Save line in state
        state.previousLines = [{ type: lineType, ...lineContext }];

        // Apply block level style
        styles.push(`line-background-${lineType}`);

        // TODO: Parse inline styles
        //       In order to parse inline tokens, we can't simply consume the
        //       entire line like this. We have to traverse the line and actually
        //       parse the line's content for inline tokens.
        flow([get("raw"), size, times(() => stream.next())])(lineContext);
      } else {
        stream.next();
      }
    } else {
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
