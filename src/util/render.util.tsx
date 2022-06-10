import React from "react";

export const withContainer =
  <TProps, UNUSED_T>(
    Container: (props: TProps) => JSX.Element,
    props: TProps
  ) =>
  (children: JSX.Element): JSX.Element => {
    return <Container {...props}>{children}</Container>;
  };
