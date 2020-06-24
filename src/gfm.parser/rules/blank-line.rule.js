import flow from "lodash/fp/flow";
import trim from "lodash/fp/trim";
import isEmpty from "lodash/fp/isEmpty";

const isLineEmpty = flow([trim, isEmpty]);

const parse = ({ tokens, lines = [], index = 0 } = {}) => {
  const line = lines[index];

  if (isLineEmpty(line)) {
    return [...tokens, { type: "blank-line", text: line }];
  } else {
    return null;
  }
};

export default { name: "blank-line", parse };
