import React from "react";

export const withContainer = (Container, props = {}) => children => (
  <Container {...props}>{children}</Container>
);
