export type blockExpressionsParser = (
  line: string
) => { name: string; result: RegExpMatchArray }[];

export type inlineExpressionsParser = (text: string) => (string[] | null)[];
