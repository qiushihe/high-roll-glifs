import isEmpty from "lodash/fp/isEmpty";
import size from "lodash/fp/size";

export default ({ token, block /* selectionState, contentState */ }) => {
  const { type: tokenType } = token;
  const blockText = block.getText();

  const inlineStyles = [];

  if (tokenType === "atx-heading") {
    const { level, text, prefix /* suffix */ } = token;
    if (isEmpty(text)) {
      inlineStyles.push([0, size(prefix) + level, "SYNTAX_CHARACTER"]);
    } else {
      inlineStyles.push([0, size(prefix) + level + 1, "SYNTAX_CHARACTER"]);
    }
  } else {
    if (!isEmpty(blockText)) {
      inlineStyles.push([0, 1, "DUMMY_RED"]);
    }

    if (size(blockText) >= 3) {
      inlineStyles.push([size(blockText) - 1, size(blockText), "DUMMY_GREEN"]);
    }
  }

  return inlineStyles;
};
