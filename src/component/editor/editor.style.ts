import styled from "styled-components";
import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import map from "lodash/fp/map";
import join from "lodash/fp/join";

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

export const EditorContainer = styled.div<{
  outerSpacing: number;
  backgroundColor: string;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: auto;
  background-color: ${get("backgroundColor")};

  .cm-editor {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    outline: none;

    .cm-line {
      overflow: hidden;
    }

    .cm-gutterElement {
      overflow: hidden;
    }

    .cm-scroller {
      margin: ${flow([
        get("outerSpacing"),
        (value) => [value, value / 2, value, value],
        map((value) => `${value}px`),
        join(" ")
      ])};
      padding-right: ${flow([
        get("outerSpacing"),
        (value) => `${value / 2}px`
      ])};

      .cm-gutters {
        margin-right: 10px;
        background-color: transparent;

        .cm-lineNumbers {
          .cm-gutterElement {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-end;
            padding-right: 10px;
          }
        }
      }
    }
  }
`;
