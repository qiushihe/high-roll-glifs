import React from "react";
import PropTypes, { InferProps } from "prop-types";

const propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node)
  ])
};

export type PersistenceProviderProps = InferProps<typeof propTypes>;

// TODO: Actually implement this shit!

const PersistenceProvider = ({
  children
}: PersistenceProviderProps): JSX.Element => {
  return <React.Fragment>{children}</React.Fragment>;
};

PersistenceProvider.propTypes = propTypes;

PersistenceProvider.defaultProps = {
  children: null
};

export default PersistenceProvider;
