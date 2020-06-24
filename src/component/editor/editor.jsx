import React from "react";
import PropTypes from "prop-types";
import DraftJs from "draft-js";
import { Map } from "immutable";
import md5 from "md5";
import flow from "lodash/fp/flow";
import reduce from "lodash/fp/reduce";
import map from "lodash/fp/map";
import compact from "lodash/fp/compact";
import times from "lodash/fp/times";

import EditorLine from "/src/component/editor-line";
import gfmBlocksParser from "/src/gfm.parser/draftjs-blocks.parser";
import InlineStyleMap from "/src/gfm.style/inline-style-map";
import getInlineStyles from "/src/gfm.style/get-inline-styles";
import getBlockStyle from "/src/gfm.style/get-block-style";

import { Base } from "./editor.style";

const NL = "\u000A";
const CR = "\u000D";
const IRREGULAR_LINEBREAK_REGEXP = new RegExp(`${CR}${NL}|${CR}`);

// See https://github.com/facebook/draft-js/blob/master/src/model/constants/DraftEditorCommand.js
const EDITOR_COMMANDS = {
  DISABLED: {
    bold: true,
    italic: true,
    underline: true,
    code: true
  },
  THROTTLED: {
    ["delete"]: true,
    ["delete-word"]: true,
    ["backspace"]: true,
    ["backspace-word"]: true,
    ["backspace-to-start-of-line"]: true
  },
  THROTTLED_INTERVAL: 100
};

class Editor extends React.PureComponent {
  constructor(...args) {
    super(...args);

    this.state = {
      editorState: DraftJs.EditorState.createEmpty(),
      editorChecksum: null
    };

    this.blocksParser = gfmBlocksParser();
    this.lastCommandTime = 0;

    this.handleDraftJsEditorKeyCommand = this.handleDraftJsEditorKeyCommand.bind(
      this
    );
    this.handleDraftJsEditorPastedText = this.handleDraftJsEditorPastedText.bind(
      this
    );
    this.handleDraftJsEditorChange = this.handleDraftJsEditorChange.bind(this);
    this.renderBlock = this.renderBlock.bind(this);
  }

  getEditorStateUpdates({ editorState }) {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const blocksParserResult = this.blocksParser.parse({
      blocks: editorState
        .getCurrentContent()
        .getBlockMap()
        .toArray()
    });

    // TODO: Implement different update "type" so that "block token type" updates can be
    //       separated from inline style updates.

    return reduce((result, parseResult) => {
      const { block, token } = parseResult;
      const { type: tokenType } = token;
      const inlineStyles = getInlineStyles({
        token,
        block,
        selectionState,
        contentState
      });
      const inlineStylesChecksum = md5(JSON.stringify(inlineStyles));

      const blockData = block.getData();
      const blockToken = blockData.get("token") || {};
      const blockInlineStylesChecksum = blockData.get("inlineStylesChecksum");

      if (
        blockToken.type !== tokenType ||
        inlineStylesChecksum !== blockInlineStylesChecksum
      ) {
        return [
          ...result,
          { block, data: { token, inlineStylesChecksum }, inlineStyles }
        ];
      } else {
        return result;
      }
    }, [])(blocksParserResult);
  }

  updateEditorState({ editorState, updates }) {
    let newEditorState = editorState;

    if (updates.length > 0) {
      const newContentState = reduce(
        (contentState, { block, data, inlineStyles }) => {
          const blockSelection = DraftJs.SelectionState.createEmpty(
            block.getKey()
          );

          return flow([
            _contentState =>
              DraftJs.Modifier.replaceText(
                _contentState,
                blockSelection.merge({
                  focusOffset: block.getText().length
                }),
                block.getText()
              ),
            _contentState => {
              return reduce((result, inlineStyle) => {
                return DraftJs.Modifier.applyInlineStyle(
                  result,
                  blockSelection.merge({
                    anchorOffset: inlineStyle[0],
                    focusOffset: inlineStyle[1]
                  }),
                  inlineStyle[2]
                );
              }, _contentState)(inlineStyles);
            },
            _contentState =>
              DraftJs.Modifier.setBlockData(
                _contentState,
                blockSelection,
                Map(data)
              )
          ])(contentState);
        },
        editorState.getCurrentContent()
      )(updates);

      newEditorState = DraftJs.EditorState.forceSelection(
        DraftJs.EditorState.push(
          editorState,
          newContentState,
          "change-inline-style"
        ),
        editorState.getSelection()
      );
    }

    this.setState({ editorState: newEditorState });
  }

  handleDraftJsEditorKeyCommand(command, editorState, eventTimeStamp) {
    if (EDITOR_COMMANDS.DISABLED[command]) {
      return "handled";
    }

    if (EDITOR_COMMANDS.THROTTLED[command]) {
      if (
        eventTimeStamp - this.lastCommandTime >
        EDITOR_COMMANDS.THROTTLED_INTERVAL
      ) {
        this.lastCommandTime = eventTimeStamp;
        return "not-handled";
      } else {
        return "handled";
      }
    }

    return "not-handled";
  }

  handleDraftJsEditorPastedText(text, _, editorState) {
    const pastedBlocks = DraftJs.ContentState.createFromText(
      text.replace(IRREGULAR_LINEBREAK_REGEXP, NL),
      NL
    ).getBlockMap();

    const newContentState = DraftJs.Modifier.replaceWithFragment(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      pastedBlocks
    );

    // Manually call `handleDraftJsEditorChange` because we have manually
    // constructed a updated editorState.
    this.handleDraftJsEditorChange(
      DraftJs.EditorState.push(editorState, newContentState, "insert-fragment")
    );

    // Returning "handled" prevent the default paste behaviour from happening.
    // This is necessary because we've manually called `handleDraftJsEditorChange`.
    return "handled";
  }

  handleDraftJsEditorChange(editorState) {
    this.updateEditorState({
      editorState,
      updates: this.getEditorStateUpdates({ editorState })
    });
  }

  renderBlock(block) {
    const blockType = block.getType();

    if (blockType === "unstyled") {
      return {
        component: EditorLine,
        editable: true,
        props: {}
      };
    }
  }

  render() {
    const { editorState } = this.state;

    return (
      <Base>
        <DraftJs.Editor
          readOnly={false}
          stripPastedStyles={true}
          editorState={editorState}
          blockRendererFn={this.renderBlock}
          handlePastedText={this.handleDraftJsEditorPastedText}
          handleKeyCommand={this.handleDraftJsEditorKeyCommand}
          onChange={this.handleDraftJsEditorChange}
          customStyleFn={(_, block) => getBlockStyle({ block })}
          customStyleMap={InlineStyleMap}
        />
      </Base>
    );
  }
}

Editor.propTypes = {
  editorId: PropTypes.string
};

Editor.defaultProps = {
  editorId: ""
};

export default Editor;
