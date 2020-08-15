import rule from "/src/gfm.parser/rule/inline/code-span.rule";

import { testOutput, mapInlineTokens } from "/test/util/parser.util";

describe("gfm.parser / rule / inline / code-span.rule", () => {
  testOutput(
    rule,
    mapInlineTokens([
      [["code-span"], "+"],
      [["code-span", "inline-syntax"], "#"]
    ])
  )([
    ["`one`", "#+++#"],
    ["``one``", "##+++##"],
    ["``one`two``", "##+++++++##"],
    ["``one ` two``", "##+++++++++##"],
    ["`one``two`", "#++++++++#"],
    ["`one `` two`", "#++++++++++#"],
    ["` `` `", "#++++#"],
    ["one `two` tri", "xxxx#+++#xxxx"],
    ["`one``two``", "xxxx##+++##"],
    ["`one\\`two`", "#++++#xxxx"],
    ["``one`\\`", "xxxxx#+#"],
    ["``one`", "xxxxxx"],
    ["`one``", "xxxxxx"],
    ["````", "xxxx"]
  ]);
});
