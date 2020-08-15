export const match = (expression: RegExp) => (
  text: string
): RegExpMatchArray | null => {
  return text.match(expression);
};
