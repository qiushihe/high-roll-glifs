import React, { ChangeEvent, PureComponent, ReactNode } from "react";
import PropTypes, { InferProps } from "prop-types";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap, historyKeymap, history } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";

import { getTestDocNames, getTestDocByName } from "/src/test-doc";

import {
  liveMarkdown,
  LiveMarkdownProcessor
} from "/src/live-markdown.extension";

import { Base, EditorControls, EditorContainer } from "./editor.style";

const propTypes = {
  onChange: PropTypes.func
};

const defaultProps = {
  onChange: (): void => {}
};

type stateTypes = {
  testDocName: string;
};

class Editor extends PureComponent<InferProps<typeof propTypes>, stateTypes> {
  static propTypes = propTypes;
  static defaultProps = defaultProps;

  editorContainerRef: React.RefObject<HTMLDivElement>;
  editorView: EditorView | null;
  editorState: EditorState | null;

  constructor(
    props: InferProps<typeof propTypes>,
    ctx: Record<string, unknown>
  ) {
    super(props, ctx);

    this.state = {
      testDocName: ""
    };

    this.editorContainerRef = React.createRef();
    this.editorState = null;
    this.editorView = null;

    this.handleTestDocumentSelectionChange =
      this.handleTestDocumentSelectionChange.bind(this);
  }

  componentDidMount(): void {
    const processor = LiveMarkdownProcessor.getDefaultInstance();

    this.editorState = EditorState.create({
      doc: "",
      extensions: [
        EditorView.lineWrapping,
        lineNumbers(),
        history(),
        markdown({ base: markdownLanguage, addKeymap: false }),
        liveMarkdown({ processor, inspector: true, liveNodes: true }),
        keymap.of(defaultKeymap),
        keymap.of(historyKeymap)
      ]
    });

    if (this.editorContainerRef.current) {
      this.editorView = new EditorView({
        state: this.editorState,
        parent: this.editorContainerRef.current
      });
    }

    this.setState({
      testDocName: window.localStorage.getItem("hrg-editor-test-doc-name") || ""
    });
  }

  componentDidUpdate(_: never, prevState: Readonly<stateTypes>): void {
    const { testDocName: testDocNameWas } = prevState;
    const { testDocName } = this.state;

    if (testDocNameWas !== testDocName) {
      this.loadTestDoc({ docName: testDocName });
    }
  }

  handleTestDocumentSelectionChange(evt: ChangeEvent<HTMLSelectElement>): void {
    const testDocName = evt.target.value;
    window.localStorage.setItem("hrg-editor-test-doc-name", testDocName);
    this.setState({ testDocName });
  }

  loadTestDoc({ docName }: { docName: string }): void {
    this.editorView.dispatch({
      changes: {
        from: 0,
        to: this.editorView.state.doc.length,
        insert: getTestDocByName(docName) || ""
      }
    });
  }

  render(): ReactNode {
    const { testDocName } = this.state;

    return (
      <Base>
        <EditorControls>
          <label>
            Test Document: &nbsp;
            <select
              value={testDocName}
              onChange={this.handleTestDocumentSelectionChange}
            >
              <option value="empty">- none -</option>
              {getTestDocNames().map((docKey) => (
                <option key={docKey} value={docKey}>
                  {docKey}
                </option>
              ))}
            </select>
          </label>
        </EditorControls>
        <EditorContainer ref={this.editorContainerRef} />
      </Base>
    );
  }
}

export default Editor;
