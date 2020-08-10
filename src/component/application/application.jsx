import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import Editor, { EditorV6 } from "/src/component/editor";

const Base = styled.div`
  height: 100%;
`;

class Application extends React.PureComponent {
  constructor(...args) {
    super(...args);

    this.useV6 = true;
  }
  componentDidMount() {
    const { onMount } = this.props;
    onMount();
  }

  renderEditor() {
    return <Editor onChange={(/* editor, data, value */) => {}} />;
  }

  renderEditorV6() {
    return <EditorV6 onChange={(/* editor, data, value */) => {}} />;
  }

  render() {
    return (
      <Base>{this.useV6 ? this.renderEditorV6() : this.renderEditor()}</Base>
    );
  }
}

Application.propTypes = {
  onMount: PropTypes.func
};

Application.defaultProps = {
  onMount: () => {}
};

export default Application;
