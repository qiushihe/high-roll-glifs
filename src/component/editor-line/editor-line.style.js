import styled from "styled-components";

export const Base = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const Gutter = styled.div.attrs({
  contentEditable: false,
  readOnly: true
})`
  flex: 0;
  user-select: none;
  padding-right: 10px;
  font-family: monospace;
`;
