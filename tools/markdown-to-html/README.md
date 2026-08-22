# Markdown to HTML Converter

Convert Markdown to clean HTML with a live preview.

## Features

- **Real-time conversion** as you type
- **Syntax highlighting** for code blocks
- **Tables**, **lists**, **blockquotes** support
- **Copy HTML** or **copy as plain text**
- **Preview/Raw HTML toggle**

## Supported Markdown Syntax

| Element | Syntax | Example |
|---------|--------|---------|
| Headers | `# H1` to `###### H6` | `# Title` |
| Bold | `**text**` or `__text__` | `**bold**` |
| Italic | `*text*` or `_text_` | `*italic*` |
| Bold + Italic | `***text***` | `***both***` |
| Strikethrough | `~~text~~` | `~~deleted~~` |
| Inline Code | `` `code` `` | `` `const x = 1` `` |
| Code Block | `` ```lang\ncode\n``` `` | `` ```js\n...\n``` `` |
| Link | `[text](url)` | `[GitHub](https://github.com)` |
| Image | `![alt](url)` | `![Logo](logo.png)` |
| Blockquote | `> text` | `> Quote` |
| Horizontal Rule | `---` or `***` | `---` |
| Unordered List | `- item` or `* item` | `- Item 1` |
| Ordered List | `1. item` | `1. First` |
| Table | `\| A \| B \|\n\|---\|---\|\n\| 1 \| 2 \|` | See example |

## Technical Details

- Built with React + TypeScript
- Custom Markdown parser (no external dependencies)
- Client-side only - no server required
- Exports clean, semantic HTML

## License

MIT License - feel free to use in your own projects!