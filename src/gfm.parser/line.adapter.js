import constant from "lodash/fp/constant";

export const adaptStream = stream => {
  const adapter = {};

  adapter.match = pattern => stream.match(pattern, false);

  adapter.lookAhead = number => stream.lookAhead(number);

  return adapter;
};

export const adaptString = string => {
  const adapter = {};

  adapter.match = pattern => string.match(pattern);

  adapter.lookAhead = constant(null);

  return adapter;
};
