import React from "react";
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
    PropTypes.arrayOf(PropTypes.node)
  ])
};

export type NormalizedStyleProviderProps = InferProps<typeof propTypes>;

const NormalizedStyleProvider = ({
  children
}: NormalizedStyleProviderProps): JSX.Element => {
  return (
    <React.Fragment>
      <NormalizeStyles />
      <GlobalStyle />
      {children}
    </React.Fragment>
  );
};

NormalizedStyleProvider.propTypes = propTypes;

NormalizedStyleProvider.defaultProps = {
  children: null
};

export default NormalizedStyleProvider;
