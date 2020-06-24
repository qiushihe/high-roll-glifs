import DraftJs from "draft-js";

const markdownLineBuilder = () => {
  const builder = {};

  let key = DraftJs.genKey();
  let depth = 0;
  let type = "markdown-line";
  let text = "";
  let entityRanges = [];
  let inlineStyleRanges = [];
  let data = {};

  builder.key = value => {
    key = value;
    return builder;
  };

  builder.type = value => {
    type = value;
    return builder;
  };

  builder.text = value => {
    text = value;
    return builder;
  };

  builder.entity = value => {
    entityRanges.push(value);
    return builder;
  };

  builder.inlineStyle = value => {
    inlineStyleRanges.push(value);
    return builder;
  };

  builder.data = (key, value) => {
    data[key] = value;
    return builder;
  };

  builder.build = () => ({
    key,
    depth,
    type,
    text,
    entityRanges,
    inlineStyleRanges,
    data
  });

  return builder;
};

export default markdownLineBuilder;
