import React, { ComponentType, ReactNode } from "react";

export const withContainer = <TProps, UNUSED_T>(
  Container: ComponentType<TProps>,
  props: TProps
) => (children: ReactNode): ReactNode => (
  <Container {...props}>{children}</Container>
);
