import React, { ReactNode, Component, createElement } from "react";

type ContainerComponent<TProps> = (new(...args: any[]) => Component<TProps, any>);

export const withContainer =
  <TProps, UNUSED_T>(Container: ContainerComponent<TProps>, props: TProps) =>
  (children: ReactNode): ReactNode => createElement(Container, { ...props, children });
