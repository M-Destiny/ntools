# URL Encoder / Decoder

Encode or decode URLs and URL components. Handles special characters, spaces, Unicode, and percent-encoding.

## Features

- **Encode**: Convert text to URL-safe format using `encodeURIComponent`
- **Decode**: Convert percent-encoded URLs back to readable text using `decodeURIComponent`
- **Swap**: Instantly swap input and output to reverse the operation
- **Copy**: One-click copy to clipboard
- **Example**: Load a sample URL to test

## Usage

1. Select **Encode** or **Decode** mode
2. Paste your text or encoded URL
3. Result appears instantly
4. Click **Copy Result** or **Swap** to reverse

## Character Reference

| Character | Encoded |
|-----------|---------|
| Space | `%20` |
| `!` | `%21` |
| `#` | `%23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |
| `'` | `%27` |
| `(` | `%28` |
| `)` | `%29` |
| `*` | `%2A` |
| `+` | `%2B` |
| `,` | `%2C` |
| `/` | `%2F` |
| `:` | `%3A` |
| `;` | `%3B` |
| `=` | `%3D` |
| `?` | `%3F` |
| `@` | `%40` |
| `[` | `%5B` |
| `]` | `%5D` |
| Unicode (é) | `%C3%A9` |

## Technical Details

- Uses `encodeURIComponent()` / `decodeURIComponent()` (not `encodeURI`)
- Encodes all characters except: `A-Z a-z 0-9 - _ . ~`
- Preserves UTF-8 encoding for Unicode characters
- Handles malformed input gracefully with error messages