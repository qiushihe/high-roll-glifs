import React from "react";
import PropTypes from "prop-types";

import gfmMode from "/src/gfm.mode";

import { Base } from "./editor.style";

// TODO: Provide an prop to control if the editor should be controlled or not.

class Editor extends React.PureComponent {
  constructor(...args) {
    super(...args);

    this.modeDefinition = gfmMode();
  }

  render() {
    const { onChange } = this.props;

    // See https://github.com/scniro/react-codemirror2 for component docs

    // TODO: Provide an prop to control if the editor should be controlled or not.

    return (
      <Base
        value={""}
        options={{ lineWrapping: true, lineNumbers: true }}
        defineMode={this.modeDefinition}
        onChange={onChange}
      />
    );
  }
}

Editor.propTypes = {
  onChange: PropTypes.func
};

Editor.defaultProps = {
  onChange: () => {}
};

export default Editor;
