import React, { PureComponent, ReactNode } from "react";
import PropTypes, { InferProps } from "prop-types";

import { EditorView } from "@codemirror/next/view";
import { EditorState } from "@codemirror/next/state";
import { keymap } from "@codemirror/next/view";
import { history, historyKeymap } from "@codemirror/next/history";
import { lineNumbers } from "@codemirror/next/gutter";
import { defaultKeymap } from "@codemirror/next/commands";

import { highlighter as gfmHighlighter } from "/src/gfm.parser";

import { Base } from "./editor.style";

const propTypes = {
  onChange: PropTypes.func
};

const defaultProps = {
  onChange: (): void => {}
};

class Editor extends PureComponent<InferProps<typeof propTypes>> {
  static propTypes = propTypes;
  static defaultProps = defaultProps;

  rootRef: React.RefObject<HTMLDivElement>;
  editorView: EditorView | null;
  editorState: EditorState | null;

  constructor(
    props: InferProps<typeof propTypes>,
    ctx: Record<string, unknown>
  ) {
    super(props, ctx);

    this.rootRef = React.createRef();
    this.editorState = null;
    this.editorView = null;
  }

  componentDidMount(): void {
    this.editorState = EditorState.create({
      // doc: "on`e two\nth`ree fo<ur\nfiv>e six",
      // doc: "one\n> tw`o\nth`re`e\n> fo`ur\nfive\nsix\n\nseven",
      // doc: "one\n```\ntwo\nthree\nfour\n````\nfive",
      // doc: "one\n    two\n    three\n    four\nfive",
      // doc: "one\n* two\nthree\nfour\n5. five\nsix\nseven\n\neight",
      doc: "one\n\ntwo three\nfive six\n------\nseven",
      extensions: [
        lineNumbers(),
        history(),
        gfmHighlighter(),
        keymap([...defaultKeymap, ...historyKeymap])
      ]
    });

    if (this.rootRef.current) {
      this.editorView = new EditorView({
        state: this.editorState,
        parent: this.rootRef.current
      });
    }
  }

  render(): ReactNode {
    return <Base ref={this.rootRef} />;
  }
}

export default Editor;
