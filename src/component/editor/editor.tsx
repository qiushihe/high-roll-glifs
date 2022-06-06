import React from "react";
import { ChangeEvent, useEffect, useState, useRef, useCallback } from "react";
import usePrevious from "use-previous";
import PropTypes, { InferProps } from "prop-types";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap, historyKeymap, history } from "@codemirror/commands";

import { getTestDocNames, getTestDocByName } from "/src/test-doc";

import {
  liveMarkdown,
  LiveMarkdownProcessor
} from "/src/live-markdown.extension";

import { Base, EditorControls, EditorContainer } from "./editor.style";

const propTypes = {
  debug: PropTypes.bool,
  outerSpacing: PropTypes.number,
  onChange: PropTypes.func
};

export type EditorProps = InferProps<typeof propTypes>;

const Editor = ({
  debug,
  outerSpacing,
  onChange: UNUSED_onChange
}: EditorProps): JSX.Element => {
  const [testDocName, setTestDocName] = useState("");
  const testDocNameWas = usePrevious(testDocName);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorStateRef = useRef<EditorState>(null);
  const editorViewRef = useRef<EditorView>(null);

  const handleTestDocumentSelectionChange = useCallback(
    (evt: ChangeEvent<HTMLSelectElement>) => {
      const testDocName = evt.target.value;
      window.localStorage.setItem("hrg-editor-test-doc-name", testDocName);
      setTestDocName(testDocName);
    },
    []
  );

  const loadTestDoc = useCallback((docName: string) => {
    editorViewRef.current.dispatch({
      changes: {
        from: 0,
        to: editorViewRef.current.state.doc.length,
        insert: getTestDocByName(docName) || ""
      }
    });
  }, []);

  useEffect(() => {
    const processor = LiveMarkdownProcessor.getDefaultInstance();

    editorStateRef.current = EditorState.create({
      doc: "",
      extensions: [
        EditorView.lineWrapping,
        history(),
        liveMarkdown({ processor, inspector: debug, liveNodes: true }),
        keymap.of(defaultKeymap),
        keymap.of(historyKeymap),
        ...(debug ? [lineNumbers()] : [])
      ]
    });

    if (editorContainerRef.current) {
      editorViewRef.current = new EditorView({
        state: editorStateRef.current,
        parent: editorContainerRef.current
      });
    }

    setTestDocName(
      window.localStorage.getItem("hrg-editor-test-doc-name") || ""
    );
  }, []);

  useEffect(() => {
    if (testDocNameWas !== testDocName) {
      loadTestDoc(testDocName);
    }
  }, [testDocName]);

  return (
    <Base>
      <EditorControls>
        <label>
          Test Document: &nbsp;
          <select
            value={testDocName}
            onChange={handleTestDocumentSelectionChange}
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
      <EditorContainer ref={editorContainerRef} outerSpacing={outerSpacing} />
    </Base>
  );
};

Editor.propTypes = propTypes;

Editor.defaultProps = {
  debug: false,
  outerSpacing: 20,
  onChange: (): void => {}
};

export default Editor;
