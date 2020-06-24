const inlineStyleBuilder = () => {
  const builder = {};

  let offset = 0;
  let length = 0;
  let style = "NONE";

  builder.offset = value => {
    offset = value;
    return builder;
  };

  builder.length = value => {
    length = value;
    return builder;
  };

  builder.style = value => {
    style = value;
    return builder;
  };

  builder.build = () => ({
    offset,
    length,
    style
  });

  return builder;
};

export default inlineStyleBuilder;
