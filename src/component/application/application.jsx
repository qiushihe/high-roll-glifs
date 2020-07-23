import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import Editor from "/src/component/editor";

const Base = styled.div`
  height: 100%;
`;

class Application extends React.PureComponent {
  componentDidMount() {
    const { onMount } = this.props;
    onMount();
  }

  render() {
    return (
      <Base>
        <Editor onChange={(/* editor, data, value */) => {}} />
      </Base>
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
