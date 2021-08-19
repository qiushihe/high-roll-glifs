import { EditorView } from "@codemirror/view";
import { Extension, StateField, EditorState } from "@codemirror/state";
import { Tooltip, showTooltip } from "@codemirror/tooltip";
import { syntaxTree } from "@codemirror/language";

class Inspector {
  private static defaultInstance = null;

  static getDefaultInstance(): Inspector {
    if (this.defaultInstance === null) {
      this.defaultInstance = new Inspector();
    }
    return this.defaultInstance;
  }

  getTooltips(state: EditorState): readonly Tooltip[] {
    const selectionRanges = state.selection.ranges.filter(
      (selectionRange) => selectionRange.empty
    );

    return selectionRanges.map((selectionRange) => {
      const line = state.doc.lineAt(selectionRange.head);
      const position = line.number + ":" + (selectionRange.head - line.from);

      const cursor = syntaxTree(state).cursor(selectionRange.head);
      const paths = [cursor.type.name];

      while (cursor.parent()) {
        paths.unshift(cursor.type.name);
      }

      return {
        pos: selectionRange.head,
        above: true,
        class: "cm-markdown-inspector-tooltip",
        create: () => {
          const dom = document.createElement("div");
          dom.innerHTML = "(" + position + ") " + paths.join(" > ");
          return { dom };
        }
      };
    });
  }
}

const stateField = StateField.define<readonly Tooltip[]>({
  create: Inspector.getDefaultInstance().getTooltips,

  update(tooltips, transaction) {
    if (!transaction.docChanged && !transaction.selection) {
      return tooltips;
    } else {
      return Inspector.getDefaultInstance().getTooltips(transaction.state);
    }
  },

  provide: (field) =>
    showTooltip.computeN([field], (state) => state.field(field))
});

const theme = EditorView.baseTheme({
  ".cm-tooltip.cm-markdown-inspector-tooltip": {
    fontFamily: "sans-serif",
    fontSize: "12px",
    backgroundColor: "#66b",
    color: "white",
    border: "none",
    padding: "2px 7px",
    borderRadius: "10px"
  }
});

export default (): Extension[] => [stateField, theme];
