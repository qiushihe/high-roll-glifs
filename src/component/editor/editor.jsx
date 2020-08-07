import React from "react";
import PropTypes from "prop-types";

import gfmMode, { LineStateUpdater } from "/src/gfm.mode";

import { Base } from "./editor.style";

// TODO: Provide an prop to control if the editor should be controlled or not.

class Editor extends React.PureComponent {
  constructor(...args) {
    super(...args);

    this.modeDefinition = gfmMode();
    this.lineStateUpdater = new LineStateUpdater();

    this.handleChange = this.handleChange.bind(this);
    this.handleCursorActivity = this.handleCursorActivity.bind(this);
  }

  componentWillUnmount() {
    this.lineStateUpdater.kill();
  }

  handleChange(editor, data, value) {
    const { onChange } = this.props;
    onChange(editor, data, value);
  }

  handleCursorActivity(editor) {
    this.lineStateUpdater.update(editor);
  }

  render() {
    // See https://github.com/scniro/react-codemirror2 for component docs

    // TODO: Provide an prop to control if the editor should be controlled or not.

    return (
      <Base
        value={""}
        options={{ lineWrapping: true, lineNumbers: true }}
        defineMode={this.modeDefinition}
        onChange={this.handleChange}
        onCursorActivity={this.handleCursorActivity}
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
