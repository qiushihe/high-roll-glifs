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
      // doc: "# one\ntwo\n### three\n\nfour",
      // doc: "on`e two\nth`ree fo<ur\nfiv>e six",
      // doc: "one\n> tw`o\nth`re`e\n> fo`ur\nfive\nsix\n\nseven",
      // doc: "one\n```\ntwo\nthree\nfour\n````\nfive",
      // doc: "one\n    two\n    three\n    four\nfive",
      // doc: "one\n* two\nthree\nfour\n5. five\nsix\nseven\n  \neight\n\nnine",
      // doc: "one\n\ntwo three\nfive six\n------\nseven",
      // doc: "one\n\n------\n\ntwo",
      // doc: "one\n\n```\ntwo\nthree\n`````\n\n    four\n    five\n\nsix",
      // doc: "one\n\n![two three](http://four.com/five.png)\n\nsix",
      // doc: "one\n\ntwo <http://three.com/four> five\n\nsix",
      // doc: "one **two ___three *half* four___ five** six",
      doc: [
        "zero\n",
        "one **two three** four",
        "five ___six seven___ eight **nine __ten",
        "eleven__ twelve thirteen** fourteen\n",
        "sixteen"
      ].join("\n"),
      extensions: [
        lineNumbers(),
        history(),
        gfmHighlighter(),
        keymap.of([...defaultKeymap, ...historyKeymap])
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
