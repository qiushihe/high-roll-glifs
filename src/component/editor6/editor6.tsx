import React, { PureComponent, ReactNode } from "react";
import PropTypes, { InferProps } from "prop-types";

import { EditorView } from "@codemirror/next/view";
import { EditorState } from "@codemirror/next/state";
import { keymap } from "@codemirror/next/view";
import { history, historyKeymap } from "@codemirror/next/history";
import { lineNumbers } from "@codemirror/next/gutter";
import { defaultKeymap } from "@codemirror/next/commands";

import { extension as liveGfm } from "/src/gfm.lezer";

import { Base } from "./editor6.style";

const propTypes = {
  onChange: PropTypes.func
};

const defaultProps = {
  onChange: (): void => {}
};

class Editor6 extends PureComponent<InferProps<typeof propTypes>> {
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
      doc: "one\ntwo\n===\nthree",
      extensions: [
        lineNumbers(),
        history(),
        liveGfm(),
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

export default Editor6;
