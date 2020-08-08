import styled, { css } from "styled-components";

import { UnControlled as CodeMirror } from "react-codemirror2";
import CodeMirrorCss from "!!raw-loader!codemirror/lib/codemirror.css";

const LineTypeIndicatorCss = css`
  font-size: 8px;
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
`;

export const Base = styled(CodeMirror)`
  display: block;
  height: 100%;

  ${CodeMirrorCss};

  .CodeMirror-line.block-quote-line {
    &:after {
      ${LineTypeIndicatorCss};
      content: "Block Quote";
    }
  }

  .CodeMirror-line.bullet-list-line {
    &:after {
      ${LineTypeIndicatorCss};
      content: "Bullet List";
    }
  }

  .CodeMirror-line.ordered-list-line {
    &:after {
      ${LineTypeIndicatorCss};
      content: "Ordered List";
    }
  }

  .CodeMirror-line.atx-heading-line {
    &:after {
      ${LineTypeIndicatorCss};
      content: "ATX Heading";
    }
  }

  .CodeMirror-line.settext-heading-line {
    &:after {
      ${LineTypeIndicatorCss};
      content: "Settext Heading";
    }
  }

  .CodeMirror-line.indented-code-line {
    &:after {
      ${LineTypeIndicatorCss};
      content: "Indented Code";
    }
  }

  .CodeMirror-line.fenced-code-line {
    &:after {
      ${LineTypeIndicatorCss};
      content: "Fenced Code";
    }
  }

  .CodeMirror-line.thematic-break-line {
    &:after {
      ${LineTypeIndicatorCss};
      content: "Thematic Break";
    }
  }

  .CodeMirror-line.paragraph-line {
    &:after {
      ${LineTypeIndicatorCss};
      content: "Paragraph";
    }
  }

  .CodeMirror-line.blank-line {
    &:after {
      ${LineTypeIndicatorCss};
      content: "Blank Line";
    }
  }

  .CodeMirror-line.empty-line {
    &:after {
      ${LineTypeIndicatorCss};
      content: "Empty Line";
    }
  }

  .cm-block-syntax {
    color: #afafaf !important;

    &.cm-hidden-block-syntax {
      font-size: 0;
    }
  }

  .cm-inline-syntax {
    color: red !important;
  }

  .cm-atx-heading-level-1 {
    font-size: 30px;
    font-weight: bold;
  }
  .cm-atx-heading-level-2 {
    font-size: 28px;
    font-weight: normal;
  }
  .cm-atx-heading-level-3 {
    font-size: 24px;
    font-weight: bold;
  }
  .cm-atx-heading-level-4 {
    font-size: 22px;
    font-weight: normal;
  }
  .cm-atx-heading-level-5 {
    font-size: 18px;
    font-weight: bold;
  }
  .cm-atx-heading-level-6 {
    font-size: 16px;
    font-weight: normal;
  }

  .cm-code-span {
    font-family: monospace;
    background-color: #ffee66;
  }

  .cm-link-span {
    color: #00c;
    text-decoration: none;
  }

  .CodeMirror {
    height: 100%;
  }
`;
