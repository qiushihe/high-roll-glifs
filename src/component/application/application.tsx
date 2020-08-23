import React, { PureComponent, ReactNode } from "react";
import PropTypes, { InferProps } from "prop-types";
import styled from "styled-components";

import Editor from "/src/component/editor";

const Base = styled.div`
  height: 100%;
`;

const propTypes = {
  onMount: PropTypes.func,
};

const defaultProps = {
  onMount: (): void => {},
};

class Application extends PureComponent<InferProps<typeof propTypes>> {
  static propTypes = propTypes;
  static defaultProps = defaultProps;

  constructor(
    props: InferProps<typeof propTypes>,
    ctx: Record<string, unknown>
  ) {
    super(props, ctx);
  }

  componentDidMount(): void {
    const { onMount } = this.props;

    if (onMount) {
      onMount();
    }
  }

  render(): ReactNode {
    return (
      <Base>
        <Editor onChange={(/* editor, data, value */) => {}} />
      </Base>
    );
  }
}

Application.propTypes = {
  onMount: PropTypes.func,
};

Application.defaultProps = {
  onMount: () => {},
};

export default Application;
