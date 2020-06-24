import { createSelector } from "reselect";
import get from "lodash/fp/get";

import { fromProps } from "/src/util/selector.util";

import { editor as editorState } from "./root.selector";

export const allEditors = createSelector(editorState, get("allEditors"));

export const editorById = createSelector(
  fromProps(get("editorId")),
  allEditors,
  (editorId, editors) => get(editorId)(editors)
);

export const editorContentById = createSelector(editorById, get("content"));

export const editorSelectionById = createSelector(editorById, get("selection"));

export const editorChecksumById = createSelector(editorById, get("checksum"));
