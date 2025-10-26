const HEX_ESCAPE_PATTERN = /^[0-9a-fA-F]{2}$/;
const UNICODE_ESCAPE_PATTERN = /^[0-9a-fA-F]{4}$/;

export const regexUnescape = (input: string): string => {
  if (typeof input !== "string") {
    throw new TypeError("input argument must be a string");
  }

  if (input.length === 0) {
    return "";
  }

  let result = "";
  let i = 0;

  // Define which escape sequences should be converted to actual characters
  const stringEscapes = new Set(["n", "r", "t", "f", "v", "a", "e"]);

  while (i < input.length) {
    if (input[i] === "\\") {
      if (i + 1 < input.length) {
        const nextChar = input[i + 1];

        // Check for double backslash followed by escape sequence (e.g., \\n -> newline)
        if (nextChar === "\\" && i + 2 < input.length) {
          const charAfterBackslash = input[i + 2];

          // Only convert \\X to actual character if X is a true string escape (not \b, not regex meta)
          if (stringEscapes.has(charAfterBackslash)) {
            // Handle \\X where X is a string escape character
            switch (charAfterBackslash) {
              case "n":
                result += "\n";
                i += 3;
                continue;
              case "r":
                result += "\r";
                i += 3;
                continue;
              case "t":
                result += "\t";
                i += 3;
                continue;
              case "f":
                result += "\f";
                i += 3;
                continue;
              case "v":
                result += "\v";
                i += 3;
                continue;
              case "a":
                result += "\x07"; // bell/alert
                i += 3;
                continue;
              case "e":
                result += "\x1B"; // escape character
                i += 3;
                continue;
              default:
                // This should never happen due to the stringEscapes.has() check above
                break;
            }
          }

          // For \\x## and \\u####, convert to actual character
          if (charAfterBackslash === "x" && i + 5 <= input.length) {
            const hexCode = input.substring(i + 3, i + 5);
            if (HEX_ESCAPE_PATTERN.test(hexCode)) {
              result += String.fromCharCode(Number.parseInt(hexCode, 16));
              i += 5;
              continue;
            }
          }

          if (charAfterBackslash === "u" && i + 7 <= input.length) {
            const unicodeCode = input.substring(i + 3, i + 7);
            if (UNICODE_ESCAPE_PATTERN.test(unicodeCode)) {
              result += String.fromCharCode(Number.parseInt(unicodeCode, 16));
              i += 7;
              continue;
            }
          }

          // For \\\\ or \\<any other char>, process as escaped backslash
          // Output one backslash and continue from the character after the second backslash
          result += "\\";
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
          case "\\":
            result += "\\";
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
