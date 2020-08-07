import fastQ from "fastq";
import times from "lodash/fp/times";
import includes from "lodash/fp/includes";
import noop from "lodash/fp/noop";
import isEmpty from "lodash/fp/isEmpty";
import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import forEach from "lodash/fp/forEach";
import first from "lodash/fp/first";
import getOr from "lodash/fp/getOr";
import filter from "lodash/fp/filter";
import over from "lodash/fp/over";
import sortBy from "lodash/fp/sortBy";
import identity from "lodash/fp/identity";

import { getCursorLine } from "/src/util/codemirror.util";
import { invokeWithArgsArray } from "/src/util/function.util";
import { range } from "/src/util/array.util";

class LineStateUpdater {
  constructor() {
    this.lineMarks = {};
    this.processedLines = {};

    this.handleQueuedTask = this.handleQueuedTask.bind(this);
    this.queue = fastQ(this, this.handleQueuedTask, 1);
  }

  update(editor) {
    editor.operation(() => {
      flow([
        over([getCursorLine("anchor"), getCursorLine("head")]),
        sortBy(identity),
        invokeWithArgsArray(range),
        activeLineIndices =>
          this.queue.push(
            { type: "update-lines-state", activeLineIndices, editor },
            noop
          )
      ])(editor);
    });
  }

  handleQueuedTask(task, callback) {
    const { type: taskType, editor } = task;

    if (taskType === "update-lines-state") {
      editor.operation(() => {
        const { activeLineIndices } = task;

        times(lineIndex => {
          if (includes(lineIndex)(activeLineIndices)) {
            this.processedLines[lineIndex] = false;

            this.queue.push(
              { type: "update-active-line", lineIndex, editor },
              noop
            );
          } else {
            if (!this.processedLines[lineIndex]) {
              this.processedLines[lineIndex] = true;
              this.queue.push(
                { type: "update-inactive-line", lineIndex, editor },
                noop
              );
            }
          }
        })(editor.lineCount());

        callback(null, null);
      });
    } else if (taskType === "update-active-line") {
      editor.operation(() => {
        const { lineIndex } = task;

        if (!isEmpty(this.lineMarks[lineIndex])) {
          flow([get(lineIndex), forEach(mark => mark.clear())])(this.lineMarks);
          this.lineMarks[lineIndex] = [];
        }

        callback(null, null);
      });
    } else if (taskType === "update-inactive-line") {
      editor.operation(() => {
        const { lineIndex } = task;

        if (isEmpty(this.lineMarks[lineIndex])) {
          this.lineMarks[lineIndex] = [];

          const lineTokens = editor.getLineTokens(lineIndex);
          const firstTokenType = flow([first, getOr("", "type")])(lineTokens);
          const lineType = getOr(
            "",
            1
          )(
            firstTokenType.match(new RegExp("\\bline-background-([^\\s]+)\\b"))
          );

          if (lineType === "atx-heading-line") {
            const blockSyntaxTokens = filter(
              flow([
                get("type"),
                tokenType => tokenType.match(new RegExp("\\bblock-syntax\\b"))
              ])
            )(lineTokens);

            forEach(token => {
              const { start, end } = token;
              const mark = editor.markText(
                { line: lineIndex, ch: start },
                { line: lineIndex, ch: end },
                { className: "cm-hidden-block-syntax" }
              );

              this.lineMarks[lineIndex].push(mark);
            })(blockSyntaxTokens);
          }
        }

        callback(null, null);
      });
    } else {
      callback(null, null);
    }
  }

  kill() {
    this.queue.kill();
  }
}

export default LineStateUpdater;
