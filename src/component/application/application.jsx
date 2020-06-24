import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";

import Editor from "/src/component/editor";

const EditorContainer = styled.div`
  border: 1px solid gray;
  margin: 10px;
  // width: 200px;
`;

class Application extends React.PureComponent {
  constructor(...args) {
    super(...args);

    this.editorId = uuidv4();
  }

  componentDidMount() {
    const { onMount } = this.props;
    onMount();
  }

  render() {
    return (
      <div style={{ overflow: "auto" }}>
        <div>Editor ID: {this.editorId}</div>
        <EditorContainer>
          <Editor editorId={this.editorId} />
        </EditorContainer>
      </div>
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
