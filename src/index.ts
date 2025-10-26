const HEX_ESCAPE_PATTERN = /^[0-9a-fA-F]{2}$/;
const UNICODE_ESCAPE_PATTERN = /^[0-9a-fA-F]{4}$/;
const BACKSLASH = "\\";

/**
 * Converts escaped characters in a string to their unescaped form, reversing
 * the transformation performed by `RegExp.escape`.
 *
 * Handles escape sequences (`\n`, `\t`), hex escapes (`\x41`), unicode escapes
 * (`\u0041`), and removes backslashes from escaped special characters.
 *
 * @param input - The string containing escaped characters
 * @returns The unescaped string
 * @throws {TypeError} If input is not a string
 *
 * @example
 * regexUnescape(String.raw`\n`) // → newline character
 * regexUnescape(String.raw`\*`) // → "*"
 * regexUnescape(String.raw`\\`) // → "\"
 */
export const regexUnescape = (input: string): string => {
  if (typeof input !== "string") {
    throw new TypeError("input argument must be a string");
  }

  if (input.length === 0) {
    return "";
  }

  let result = "";
  let i = 0;

  while (i < input.length) {
    if (input[i] === BACKSLASH) {
      if (i + 1 < input.length) {
        const nextChar = input[i + 1];

        // Handle double backslash: \\ -> \
        if (nextChar === BACKSLASH) {
          result += BACKSLASH;
          i += 2;
          continue;
        }

        // Handle single backslash escape sequences
        switch (nextChar) {
          case "n":
            result += "\n";
            i += 2;
            break;
          case "r":
            result += "\r";
            i += 2;
            break;
          case "t":
            result += "\t";
            i += 2;
            break;
          case "f":
            result += "\f";
            i += 2;
            break;
          case "v":
            result += "\v";
            i += 2;
            break;
          case "b":
            result += "\b";
            i += 2;
            break;
          case "a":
            result += "\x07"; // bell/alert
            i += 2;
            break;
          case "e":
            result += "\x1B"; // escape character
            i += 2;
            break;
          case "x":
            // Hex escape \x## (2 hex digits)
            if (i + 4 <= input.length) {
              const hexCode = input.substring(i + 2, i + 4);
              if (HEX_ESCAPE_PATTERN.test(hexCode)) {
                result += String.fromCharCode(Number.parseInt(hexCode, 16));
                i += 4;
                break;
              }
            }
            // If not valid hex escape, treat \ as escaping the x
            result += nextChar;
            i += 2;
            break;
          case "u":
            // Unicode escape \u#### (4 hex digits)
            if (i + 6 <= input.length) {
              const unicodeCode = input.substring(i + 2, i + 6);
              if (UNICODE_ESCAPE_PATTERN.test(unicodeCode)) {
                result += String.fromCharCode(Number.parseInt(unicodeCode, 16));
                i += 6;
                break;
              }
            }
            // If not valid unicode escape, treat \ as escaping the u
            result += nextChar;
            i += 2;
            break;
          default:
            // For any other character after \, just use that character
            // This handles regex special characters like \*, \+, \(, etc.
            // The backslash is simply removed
            result += nextChar;
            i += 2;
            break;
        }
      } else {
        // Trailing backslash at end of string - skip it
        i++;
      }
    } else {
      // Regular character
      result += input[i];
      i++;
    }
  }

  return result;
};
