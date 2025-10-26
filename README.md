# `regexUnescape`

> Converts escaped regex strings back to their original form. Does the opposite of `RegExp.escape`.

## What it does

```typescript
regexUnescape("\\n"); // → actual newline
regexUnescape("\\*"); // → "*"
regexUnescape("\\\\"); // → "\"
```

## Install

```bash
npm install regex-unescape
# or
yarn add regex-unescape
pnpm install regex-unescape
bun add regex-unescape
```

## Usage

```typescript
import { regexUnescape } from "regex-unescape";

regexUnescape(String.raw`\\n\\t`); // → newline + tab
regexUnescape(String.raw`\*\+`); // → "*+"

// Throws on non-string input (same as RegExp.escape)
regexUnescape(123); // ❌ Error: input argument must be a string
```

## What gets converted

| Input    | Output  | Note             |
| -------- | ------- | ---------------- |
| `\\n`    | newline | Escape sequences |
| `\\t`    | tab     |                  |
| `\\*`    | `*`     | Special chars    |
| `\\`     | `\`     | Backslashes      |
| `\x41`   | `A`     | Hex codes        |
| `\u2764` | `❤`     | Unicode          |

## Round-trip with RegExp.escape

```typescript
const original = "Hello*World\n";
const escaped = RegExp.escape(original);
const back = regexUnescape(escaped);
// back === original ✓
```

## License

MIT
