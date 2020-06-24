import size from "lodash/fp/size";
import map from "lodash/fp/map";

import parseWithRules from "./parse-with-rules";
import { getAllRules } from "./rules";

const uncappedMap = map.convert({ cap: false });

export default () => {
  const rules = getAllRules();
  const parser = {};

  parser.parse = ({ blocks }) => {
    const lines = [];
    const blockByIndex = {};

    let tokens = [];
    let blockIndex = 0;

    while (true) {
      if (blockIndex >= size(blocks)) {
        break;
      }

      const block = blocks[blockIndex];

      lines.push(block.getText());
      blockByIndex[blockIndex] = block;

      tokens = parseWithRules({ rules, tokens, lines, index: blockIndex });

      blockIndex += 1;
    }

    return uncappedMap((token, index) => ({
      token,
      block: blockByIndex[index]
    }))(tokens);
  };

  return parser;
};
