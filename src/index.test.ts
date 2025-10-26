/** biome-ignore-all lint/style/noMagicNumbers: <tests> */
import { describe, expect, it } from "vitest";
import { regexUnescape } from "./index";

describe("regexUnescape", () => {
  it.each([
    ["Hello", "Hello"],
    [String.raw`\#\$\^\*\+\(\)\{}<>\\\|\.\ `, "#$^*+(){}<>\\|. "],
    [String.raw`\\n\\r\\t\\f`, "\n\r\t\f"],
    [String.raw`\\`, "\\"],
    ["\\", ""],
    ["", ""],
  ])("unescapes %s", (input, expected) => {
    expect(regexUnescape(input)).toBe(expected);

    if (expected) {
      expect(regexUnescape(input.repeat(100))).toBe(expected.repeat(100));
    }
  });

  it("throws on non-string input", () => {
    expect(() => regexUnescape(123 as any)).toThrow(
      "input argument must be a string"
    );
    expect(() => regexUnescape(null as any)).toThrow(
      "input argument must be a string"
    );
    expect(() => regexUnescape(undefined as any)).toThrow(
      "input argument must be a string"
    );
  });

  describe("round-trip basic cases", () => {
    it.each([["Hello"], ["#$^*+(){}<>\\|. "], ["\n\r\t\f"], ["\\"], [""]])(
      "escape then unescape: %s",
      (original) => {
        // @ts-expect-error FIXME:
        const escaped = RegExp.escape(original);
        const unescaped = regexUnescape(escaped);
        expect(unescaped).toBe(original);
      }
    );
  });

  describe("round-trip with RegExp.escape", () => {
    it.each([
      [String.raw`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`],
      [String.raw`https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}`],
      [String.raw`^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$`],
      [String.raw`^\d{4}-\d{2}-\d{2}$`],
      [String.raw`^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$`],
      ["^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$"],
      [String.raw`(.*?)(\d+)(.*)`],
      [String.raw`\b\w+\b`],
      [String.raw`(?<=\$)\d+(?:\.\d{2})?`],
      [String.raw`[(){}\[\]<>|.*+?^$\\]`],
    ])("escapes and unescapes: %s", (pattern) => {
      // @ts-expect-error FIXME:
      const escaped = RegExp.escape(pattern);
      const unescaped = regexUnescape(escaped);
      expect(unescaped).toBe(pattern);
    });
  });
});
