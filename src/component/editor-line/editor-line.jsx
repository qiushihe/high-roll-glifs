import React from "react";
import PropTypes from "prop-types";
import DraftJs from "draft-js";

import { Base, Gutter } from "./editor-line.style";

const TOKEN_TYPE_PREFIX = {
  ["block-quote"]: "|BQ",
  ["atx-heading"]: "|AH",
  ["settext-heading"]: "|SH",
  ["thematic-break"]: "|TB",
  ["paragraph"]: "|PG",
  ["blank-line"]: "|BL"
};

class EditorLine extends React.PureComponent {
  render() {
    const { block } = this.props;
    // console.log(block.getKey(), block.getData().toJSON(), block.getText());

    const blockToken = block.getData().get("token") || {};
    const { type: blockTokenType } = blockToken;
    const tokenTypePrefix = TOKEN_TYPE_PREFIX[blockTokenType];

    return (
      <Base>
        <Gutter>
          {block.getKey()}
          {tokenTypePrefix}
        </Gutter>
        <DraftJs.EditorBlock {...this.props} />
      </Base>
    );
  }
}

EditorLine.propTypes = {
  block: PropTypes.any
};

EditorLine.defaultProps = {
  block: null
};

export default EditorLine;
