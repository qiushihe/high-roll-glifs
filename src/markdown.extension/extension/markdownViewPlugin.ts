import { Extension } from "@codemirror/state";

import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate
} from "@codemirror/view";

import { default as MarkdownProcessor } from "../processor/markdownProcessor";

class MarkdownViewPlugin {
  private static defaultInstance: MarkdownViewPlugin;

  static getDefaultInstance(): MarkdownViewPlugin {
    if (!this.defaultInstance) {
      this.defaultInstance = new MarkdownViewPlugin();
    }
    return this.defaultInstance;
  }

  private markdownProcessor: MarkdownProcessor;
  private editorView: EditorView;

  setMarkdownProcessor(markdownProcessor: MarkdownProcessor) {
    this.markdownProcessor = markdownProcessor;
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
      this.markdownProcessor.setViewportRange(
        this.editorView.viewport.from,
        this.editorView.viewport.to
      );
    }
  }
}

const markdownViewPluginExtension = (markdownProcessor: MarkdownProcessor) =>
  ViewPlugin.define(
    (view: EditorView): MarkdownViewPlugin => {
      const plugin = MarkdownViewPlugin.getDefaultInstance();
      plugin.setMarkdownProcessor(markdownProcessor);
      plugin.setEditorView(view);
      return plugin;
    },
    {
      decorations: (decorator) => decorator.getDecorations()
    }
  );

export default (markdownProcessor: MarkdownProcessor): Extension[] => [
  markdownViewPluginExtension(markdownProcessor)
];
