import flow from "lodash/fp/flow";
import trim from "lodash/fp/trim";
import negate from "lodash/fp/negate";
import isEmpty from "lodash/fp/isEmpty";

const isLineNotEmpty = flow([trim, negate(isEmpty)]);

const parse = ({ tokens, lines = [], index = 0 } = {}) => {
  const line = lines[index];

  if (isLineNotEmpty(line)) {
    return [...tokens, { type: "paragraph", text: line }];
  } else {
    return null;
  }
};

export default { name: "paragraph", parse };
