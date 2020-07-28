import nodeHook from "node-hook";

const stub = (source, filename) => `() => "stubbed ${filename}";`;

nodeHook.hook(".png", stub);
nodeHook.hook(".svg", stub);
