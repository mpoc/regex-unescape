import { describe, expect, it } from "vitest";
import { regexUnescape } from "./index";

declare global {
  // biome-ignore lint/style/useConsistentTypeDefinitions: <need to use interface here>
  interface RegExpConstructor {
    escape(str: string): string;
  }
}

const roundTripPreserves = (pattern: string) => {
  const escaped = RegExp.escape(pattern);
  const unescaped = regexUnescape(escaped);
  return pattern === unescaped;
};

describe("regexUnescape", () => {
  it.each([
    ["Hello", "Hello"],
    [/\#\$\^\*\+\(\)\{}<>\\\|\.\ /.source, "#$^*+(){}<>\\|. "],
    [/\\n\\r\\t\\f/.source, String.raw`\n\r\t\f`],
    [/\\/.source, "\\"],
    ["\\", ""],
    ["", ""],
  ])("unescapes %s", (input, expected) => {
    expect(regexUnescape(input)).toBe(expected);
    expect(roundTripPreserves(input)).toBe(true);

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
        expect(roundTripPreserves(original)).toBe(true);
      }
    );
  });

  describe("round-trip with RegExp.escape", () => {
    it.each([
      [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.source],
      [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}/.source],
      [/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.source],
      [/^\d{4}-\d{2}-\d{2}$/.source],
      [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.source],
      [/^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.source],
      [/(.*?)(\d+)(.*)/.source],
      [/\b\w+\b/.source],
      [/(?<=\$)\d+(?:\.\d{2})?/.source],
      [/[(){}\[\]<>|.*+?^$\\]/.source],
    ])("escapes and unescapes: %s", (pattern) => {
      expect(roundTripPreserves(pattern)).toBe(true);
    });
  });

  it("handles regex meta-characters as literals", () => {
    expect(regexUnescape(/\w/.source)).toBe("w");
    expect(regexUnescape(/\d/.source)).toBe("d");
    expect(regexUnescape(/\s/.source)).toBe("s");
  });

  it("handles hex escapes", () => {
    expect(regexUnescape(/\x41/.source)).toBe("A"); // 0x41 = 'A'
    expect(regexUnescape(/\x0A/.source)).toBe("\n"); // 0x0A = newline
  });

  it("handles unicode escapes", () => {
    expect(regexUnescape(/\u0041/.source)).toBe("A"); // U+0041 = 'A'
    expect(regexUnescape(/\u2764/.source)).toBe("❤"); // U+2764 = heart emoji
  });

  it("handles invalid hex/unicode escapes", () => {
    expect(regexUnescape(String.raw`\xGG`)).toBe("xGG"); // Invalid hex
    expect(regexUnescape(String.raw`\x4`)).toBe("x4"); // Only 1 digit
    expect(regexUnescape(String.raw`\uGGGG`)).toBe("uGGGG"); // Invalid unicode
  });

  it("handles extended escape sequences", () => {
    expect(regexUnescape(/\a/.source)).toBe("\x07"); // bell/alert
    expect(regexUnescape(/\e/.source)).toBe("\x1B"); // escape character
    expect(regexUnescape(/\v/.source)).toBe("\v"); // vertical tab
    expect(regexUnescape(/\b/.source)).toBe("\b"); // backspace
  });

  describe("commonly used regex patterns", () => {
    describe("numeric patterns", () => {
      it.each([
        ["positive integers", /^\d+$/.source],
        ["negative integers", /^-\d+$/.source],
        ["any integer", /^-?\d+$/.source],
        ["positive decimal", /^\d*\.?\d+$/.source],
        ["negative decimal", /^-\d*\.?\d+$/.source],
        ["any decimal", /^-?\d*\.?\d+$/.source],
        ["year 1900-2099", /^(19|20)\d{2}$/.source],
      ])("round-trips %s pattern: %s", (_, pattern) => {
        expect(roundTripPreserves(pattern)).toBe(true);
      });
    });

    describe("phone number patterns", () => {
      it.each([
        ["basic phone", /^\+?[\d\s]{3,}$/.source],
        ["phone with code", /^\+?[\d\s]+\(?[\d\s]{10,}$/.source],
      ])("round-trips %s pattern: %s", (_, pattern) => {
        expect(roundTripPreserves(pattern)).toBe(true);
      });
    });

    describe("date and time patterns", () => {
      it.each([
        [
          "date (dd mm yyyy)",
          /^([1-9]|0[1-9]|[12][0-9]|3[01])\D([1-9]|0[1-9]|1[012])\D(19[0-9][0-9]|20[0-9][0-9])$/
            .source,
        ],
      ])("round-trips %s pattern: %s", (_, pattern) => {
        expect(roundTripPreserves(pattern)).toBe(true);
      });
    });

    describe("IP address patterns", () => {
      it.each([
        [
          "IPv4",
          /^(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]){3}$/
            .source,
        ],
      ])("round-trips %s pattern: %s", (_, pattern) => {
        expect(roundTripPreserves(pattern)).toBe(true);
      });
    });

    describe("alphabetic input patterns", () => {
      it.each([
        ["personal name", /^[\w.']{2,}(\s[\w.']{2,})+$/.source],
        ["username", /^[\w\d_.]{4,}$/.source],
        ["password (6+ chars)", /^.{6,}$/.source],
        ["password or empty", /^.{6,}$|^$/.source],
        [
          "email",
          /^[_]*([a-z0-9]+(\.|_*)?)+@([a-z][a-z0-9-]+(\.|-*\.))+[a-z]{2,6}$/
            .source,
        ],
        ["domain", /^([a-z][a-z0-9-]+(\.|-*\.))+[a-z]{2,6}$/.source],
      ])("round-trips %s pattern: %s", (_, pattern) => {
        expect(roundTripPreserves(pattern)).toBe(true);
      });
    });

    describe("utility patterns", () => {
      it.each([
        ["empty input", /^$/.source],
        ["blank input", /^\s\t*$/.source],
        ["new line", /[\r\n]|$/.source],
        ["whitespace", /^\s+$/.source],
        ["URL", /^http\:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/.source],
      ])("round-trips %s pattern: %s", (_, pattern) => {
        expect(roundTripPreserves(pattern)).toBe(true);
      });
    });

    describe("complex real-world patterns", () => {
      it.each([
        [
          "email validation (complex)",
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.source,
        ],
        [
          "URL with protocol",
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}/.source,
        ],
        [
          "US phone number",
          /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.source,
        ],
        ["date (YYYY-MM-DD)", /^\d{4}-\d{2}-\d{2}$/.source],
        ["IPv4 (simple)", /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.source],
        ["hex color", /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.source],
        ["capture digits", /(.*?)(\d+)(.*)/.source],
        ["word boundary", /\b\w+\b/.source],
        ["price with lookbehind", /(?<=\$)\d+(?:\.\d{2})?/.source],
        ["special characters", /[(){}\[\]<>|.*+?^$\\]/.source],
      ])("round-trips %s pattern: %s", (_, pattern) => {
        expect(roundTripPreserves(pattern)).toBe(true);
      });
    });
  });
});
