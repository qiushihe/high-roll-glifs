export const getCursorLine = cursorStart => editor =>
  editor.getCursor(cursorStart).line;
