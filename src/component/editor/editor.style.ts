import styled from "styled-components";

export const Base = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
`;

export const EditorControls = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0;
`;

export const EditorContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: auto;

  .cm-wrap {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    outline: none;
  }
`;
