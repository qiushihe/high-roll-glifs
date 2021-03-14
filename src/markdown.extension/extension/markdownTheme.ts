import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

const markdownTheme = EditorView.baseTheme({
  ".hrg-BulletList > .hrg-ListItem > .hrg-ListMark": {
    color: "red"
    // display: "inline-block",
    // position: "relative",
    // visibility: "hidden",
    // "&:after": {
    //   content: '""',
    //   backgroundImage:
    //     "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='50'/%3E%3C/svg%3E\")",
    //   visibility: "visible",
    //   display: "inline-block",
    //   position: "absolute",
    //   top: "0",
    //   left: "0",
    //   right: "0",
    //   bottom: "0",
    //   backgroundRepeat: "no-repeat",
    //   backgroundPosition: "center",
    //   backgroundSize: "contain"
    // }
  }
});

export default (): Extension[] => [markdownTheme];
