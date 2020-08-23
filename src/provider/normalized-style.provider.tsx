import React, { PureComponent, ReactNode } from "react";
import PropTypes, { InferProps } from "prop-types";
import { createGlobalStyle } from "styled-components";

import { Normalize as NormalizeStyles } from "styled-normalize";

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
`;

const propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
};

const defaultProps = {
  children: null,
};

export class NormalizedStyleProvider extends PureComponent<
  InferProps<typeof propTypes>
> {
  static propTypes = propTypes;
  static defaultProps = defaultProps;

  render(): ReactNode {
    const { children } = this.props;

    return (
      <React.Fragment>
        <NormalizeStyles />
        <GlobalStyle />
        {children}
      </React.Fragment>
    );
  }
}

export default NormalizedStyleProvider;
