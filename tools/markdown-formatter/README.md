# Markdown Formatter

Format and beautify Markdown with consistent style. Normalize headings, lists, tables, and code blocks.

## Features

- **Live formatting** — See results as you type
- **Configurable options**:
  - Line width (40-200 characters)
  - Tab vs spaces indentation
  - Tab width (1-8 spaces)
  - Trim trailing whitespace
  - Single/double quotes preference
  - Bracket spacing
  - Prose wrap (preserve, always, never)
- **Statistics** — Lines, characters, words count
- **Live preview** — Rendered HTML preview of formatted output
- **Example loader** — Quick test with sample markdown
- **Copy to clipboard** — One-click copy

## Formatting Rules

The formatter applies these transformations:

1. **Normalize line endings** (CRLF → LF)
2. **Trim trailing whitespace** (optional)
3. **Heading spacing** — Ensure space after `#` and blank lines around headings
4. **List formatting** — Space after list markers (`- `, `1. `)
5. **Code block spacing** — Blank lines around fenced code blocks
6. **Table alignment** — Consistent pipe spacing
7. **Horizontal rules** — Normalize to `---`
8. **Paragraph spacing** — Single blank line between paragraphs
9. **Trim document** — Remove leading/trailing blank lines

## Options

| Option | Default | Description |
|--------|---------|-------------|
| Line Width | 80 | Target line length for prose wrapping |
| Use Tabs | false | Use tabs instead of spaces |
| Tab Width | 2 | Spaces per tab (when not using tabs) |
| Trim Trailing Whitespace | true | Remove trailing spaces/tabs |
| Single Quotes | false | Prefer single quotes in code |
| Bracket Spacing | true | Spaces inside brackets `{ }` |
| Prose Wrap | preserve | How to wrap prose: preserve/always/never |

## Example Input

```markdown
# Heading 1

## Heading 2

This is a paragraph with **bold** and *italic* text.

### List Example

- Item one
- Item two
  - Nested item
- Item three

1. First item
2. Second item
3. Third item

### Code Block

```javascript
function hello() {
  console.log("Hello, world!");
}
```

### Table

| Name | Age | City |
|------|-----|------|
| Alice | 30 | NYC |
| Bob | 25 | LA |

---

> Blockquote example
> Multiple lines
```

## Example Output

The formatter will produce consistently styled markdown with proper spacing, aligned tables, and normalized formatting.

## Use Cases

- **Pre-commit hook** — Format markdown before committing
- **Documentation standardization** — Consistent style across team
- **Clean up generated markdown** — Fix formatting from tools
- **Pre-publish review** — Ensure README/docs look professional