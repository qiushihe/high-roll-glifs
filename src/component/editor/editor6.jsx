import React from "react";
import PropTypes from "prop-types";

import { EditorView } from "@codemirror/next/view";
import { EditorState } from "@codemirror/next/state";
import { keymap } from "@codemirror/next/view";
import { history, historyKeymap } from "@codemirror/next/history";
import { lineNumbers } from "@codemirror/next/gutter";
import { defaultKeymap } from "@codemirror/next/commands";

import { extension as liveGfm } from "/src/gfm.lezer";

import { Base } from "./editor6.style";

class Editor6 extends React.PureComponent {
  constructor(...args) {
    super(...args);

    this.rootRef = React.createRef();
    this.editorState = null;
    this.editorView = null;
  }

  componentDidMount() {
    this.editorState = EditorState.create({
      doc: "# CodeMirror v6 Yo!",
      extensions: [
        lineNumbers(),
        history(),
        liveGfm(),
        keymap([...defaultKeymap, ...historyKeymap])
      ]
    });

    this.editorView = new EditorView({
      state: this.editorState,
      parent: this.rootRef.current
    });
  }

  render() {
    return <Base ref={this.rootRef} />;
  }
}

Editor6.propTypes = {
  onChange: PropTypes.func
};

Editor6.defaultProps = {
  onChange: () => {}
};

export default Editor6;
