# Regex Find & Replace

Find and replace text using regular expressions with full capture group support.

## Features

- **Real-time replacement** - See results instantly as you type
- **Capture group support** - Use `$1`, `$2`, etc. in replacement for capture groups
- **Named groups** - Use `$<name>` for named capture groups
- **Flag toggles** - Global, case-insensitive, multiline, dotAll
- **Common patterns** - Quick-insert buttons for emails, URLs, IPs, dates, phones
- **Match counter** - Shows number of matches found
- **Copy to clipboard** - One-click copy of result

## Usage

1. Enter your input text in the left panel
2. Enter a regex pattern (e.g., `(\w+)@(\w+)\.(\w+)`)
3. Enter replacement text (e.g., `$1 [at] $2.$3`)
4. Toggle flags as needed
5. Copy the result from the right panel

## Replacement Syntax

| Syntax | Description |
|--------|-------------|
| `$$` | Literal $ character |
| `$&` | The matched substring |
| `$`` | Text before the match |
| `$'` | Text after the match |
| `$n` | nth capture group (1-99) |
| `$<name>` | Named capture group |

## Examples

**Mask email domains:**
- Pattern: `(\w+)@(\w+)\.(\w+)`
- Replacement: `$1@****.$3`
- Input: `user@example.com`
- Output: `user@****.com`

**Reformat dates:**
- Pattern: `(\d{4})-(\d{2})-(\d{2})`
- Replacement: `$2/$3/$1`
- Input: `2026-08-21`
- Output: `08/21/2026`

**Remove extra whitespace:**
- Pattern: `\s+`
- Replacement: ` `
- Flags: `g`
- Input: `hello    world`
- Output: `hello world`