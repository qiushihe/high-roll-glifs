import DraftJs from "draft-js";
import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import map from "lodash/fp/map";
import join from "lodash/fp/join";

export const getRawContent = editorState =>
  DraftJs.convertToRaw(editorState.getCurrentContent());

export const getRawSelection = selectionState => ({
  anchorKey: selectionState.getAnchorKey(),
  anchorOffset: selectionState.getAnchorOffset(),
  focusKey: selectionState.getFocusKey(),
  focusOffset: selectionState.getFocusOffset(),
  isBackward: selectionState.getIsBackward(),
  hasFocus: selectionState.getHasFocus()
});

export const getContentPlainText = flow([
  get("blocks"),
  map(get("text")),
  join("\n")
]);
