import { ReactNode, Component, createElement } from "react";

type ContainerComponent<TProps> = new (...args: unknown[]) => Component<
  TProps,
  unknown
>;

export const withContainer =
  <TProps, UNUSED_T>(Container: ContainerComponent<TProps>, props: TProps) =>
  (children: ReactNode): ReactNode =>
    createElement(Container, props, children);
