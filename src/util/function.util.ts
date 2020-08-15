export const invoke = (fn: unknown): unknown => {
  return (fn as () => unknown)();
};
