import { Extension } from "@codemirror/state";

import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate
} from "@codemirror/view";

import Processor from "./processor";

class ViewProxy {
  private static defaultInstance: ViewProxy;

  static getDefaultInstance(): ViewProxy {
    if (!this.defaultInstance) {
      this.defaultInstance = new ViewProxy();
    }
    return this.defaultInstance;
  }

  private processor: Processor;
  private editorView: EditorView;

  setMarkdownProcessor(processor: Processor) {
    this.processor = processor;
  }

  setEditorView(editorView: EditorView) {
    this.editorView = editorView;
  }

  getDecorations(): DecorationSet {
    return Decoration.none;
  }

  // This function gets called by CodeMirror whenever something changes.
  update(update: ViewUpdate) {
    if (update.viewportChanged) {
      this.processor.setViewportRange(
        this.editorView.viewport.from,
        this.editorView.viewport.to
      );
    }
  }
}

const viewPlugin = (processor: Processor) =>
  ViewPlugin.define(
    (view: EditorView): ViewProxy => {
      const plugin = ViewProxy.getDefaultInstance();
      plugin.setMarkdownProcessor(processor);
      plugin.setEditorView(view);
      return plugin;
    },
    {
      decorations: (decorator) => decorator.getDecorations()
    }
  );

export default (processor: Processor): Extension[] => [viewPlugin(processor)];
