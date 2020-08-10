import styled, { css } from "styled-components";

const LineTypeIndicatorCss = css`
  font-size: 8px;
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
`;

export const Base = styled.div`
  display: block;
  height: 100%;

  .cm-wrap {
    height: 100%;
  }

  .cm-scroller {
    overflow: auto;
  }

  .cm-md-atx-heading,
  .cm-md-settext-heading,
  .cm-md-settext-heading-underline,
  .cm-md-thematic-break,
  .cm-md-paragraph,
  .cm-md-blank,
  .cm-md-empty {
    position: relative;
  }

  .cm-md-atx-heading:after {
    ${LineTypeIndicatorCss};
    content: "ATX Heading";
  }

  .cm-md-settext-heading:after {
    ${LineTypeIndicatorCss};
    content: "Settext Heading";
  }

  .cm-md-settext-heading-underline:after {
    ${LineTypeIndicatorCss};
    content: "Settext Underline";
  }

  .cm-md-thematic-break:after {
    ${LineTypeIndicatorCss};
    content: "Thematic Break";
  }

  .cm-md-paragraph:after {
    ${LineTypeIndicatorCss};
    content: "Paragraph";
  }

  .cm-md-blank:after {
    ${LineTypeIndicatorCss};
    content: "Blank";
  }

  .cm-md-empty:after {
    ${LineTypeIndicatorCss};
    content: "Empty";
  }
`;
