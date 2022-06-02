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
      const position = `${line.number}:${selectionRange.head - line.from} | ${
        selectionRange.head
      }`;

      const cursor = syntaxTree(state).cursor(selectionRange.head);
      const paths = [cursor.type.name];

      while (cursor.parent()) {
        paths.unshift(cursor.type.name);
      }

      return {
        pos: selectionRange.head,
        above: true,
        strictSide: false,
        arrow: true,
        create: () => {
          const dom = document.createElement("div");
          dom.className = "cm-markdown-inspector-tooltip";
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
    lineHeight: "16px",
    backgroundColor: "#66b",
    color: "white",
    border: "none",
    padding: "2px 10px",
    borderRadius: "10px",
    pointerEvents: "none",
    opacity: 0.8,
    "& .cm-tooltip-arrow:after": {
      borderTopColor: "#66b",
      borderBottomColor: "#66b"
    }
  }
});

export default (): Extension[] => [stateField, theme];
