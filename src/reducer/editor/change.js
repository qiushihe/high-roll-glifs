import md5 from "md5";
import getOr from "lodash/fp/getOr";

import { getContentPlainText } from "/src/util/draft-js.util";

export default (state = {}, { editorId, content, selection } = {}) => {
  return {
    ...state,
    allEditors: {
      ...getOr({}, "allEditors")(state),
      [editorId]: {
        content,
        selection,
        checksum: md5(getContentPlainText(content))
      }
    }
  };
};
