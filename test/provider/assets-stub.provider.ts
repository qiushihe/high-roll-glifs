import nodeHook from "node-hook";

const stub = (UNUSED_source: unknown, filename: string) =>
  `() => "stubbed ${filename}";`;

nodeHook.hook(".png", stub);
nodeHook.hook(".svg", stub);
