import { WidgetType } from "@codemirror/view";

export class LinkWidget extends WidgetType {
  constructor(readonly url: string) {
    super();
  }

  toDOM() {
    const dom = document.createElement("a");
    dom.className = "hrg-Widget hrg-LinkWidget";
    dom.setAttribute("target", "_blank");
    dom.setAttribute("href", this.url);
    dom.innerHTML = "🔗";
    dom.onmousedown = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      return false;
    };
    return dom;
  }

  ignoreEvent() {
    return true;
  }
}
