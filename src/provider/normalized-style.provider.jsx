import React from "react";
import PropTypes from "prop-types";
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

export class NormalizedStyleProvider extends React.PureComponent {
  render() {
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

NormalizedStyleProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node)
  ])
};

NormalizedStyleProvider.defaultProps = {
  children: null
};

export default NormalizedStyleProvider;
