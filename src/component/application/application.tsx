import React, { useEffect } from "react";
import PropTypes, { InferProps } from "prop-types";
import styled from "styled-components";

import Editor from "/src/component/editor";

const Base = styled.div`
  height: 100%;
`;

const propTypes = {
  onMount: PropTypes.func
};

export type ApplicationProps = InferProps<typeof propTypes>;

const Application = ({ onMount }: ApplicationProps): JSX.Element => {
  useEffect(() => {
    onMount();
  }, []);

  return (
    <Base>
      <Editor debug={true} onChange={(/* editor, data, value */) => {}} />
    </Base>
  );
};

Application.propTypes = propTypes;

Application.defaultProps = {
  onMount: (): void => {}
};

export default Application;
