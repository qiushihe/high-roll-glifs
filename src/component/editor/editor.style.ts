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
  .cm-md-block-quote,
  .cm-md-ordered-list,
  .cm-md-bullet-list,
  .cm-md-indented-code,
  .cm-md-fenced-code,
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

  .cm-md-block-quote:after {
    ${LineTypeIndicatorCss};
    content: "Block Quote";
  }

  .cm-md-ordered-list:after {
    ${LineTypeIndicatorCss};
    content: "Ordered List";
  }

  .cm-md-bullet-list:after {
    ${LineTypeIndicatorCss};
    content: "Bullet List";
  }

  .cm-md-indented-code:after {
    ${LineTypeIndicatorCss};
    content: "Indented Code";
  }

  .cm-md-fenced-code:after {
    ${LineTypeIndicatorCss};
    content: "Fenced Code";
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
