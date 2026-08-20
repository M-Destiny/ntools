# HTML to Markdown

Convert HTML to clean Markdown. Supports headings, lists, tables, code blocks, links, images, and more.

## Features

- Converts HTML headings (h1-h6) to ATX (`# Heading`) or Setext (underline) style
- Handles bold, italic, inline code, links, images
- Converts ordered/unordered lists and nested lists
- Supports code blocks (fenced with ``` or indented with 4 spaces)
- Handles blockquotes with `>` prefix
- Basic table conversion with header detection
- Configurable output style options
- One-click copy to clipboard
- Load example HTML for testing

## Usage

1. Paste your HTML in the left panel
2. Configure options in the middle panel:
   - **Heading Style** — ATX (`# Heading`) or Setext (underline style for h1/h2)
   - **Bullet Marker** — `-`, `*`, or `+` for unordered lists
   - **Code Blocks** — Fenced (```) or Indented (4 spaces)
   - **Fence Char** — Backticks (```) or Tildes (~~~) for fenced blocks
   - **Horizontal Rule** — `---`, `***`, or `___`
   - **GFM** — Enable GitHub Flavored Markdown features (tables, strikethrough, task lists)
3. Copy the generated Markdown from the right panel

## Supported HTML Elements

| HTML | Markdown |
|------|----------|
| `<h1>`–`<h6>` | `#`–`######` or Setext underline |
| `<p>` | Paragraph text |
| `<strong>`, `<b>` | `**bold**` or `__bold__` |
| `<em>`, `<i>` | `*italic*` or `_italic_` |
| `<code>` | `` `code` `` |
| `<pre><code>` | Fenced or indented code blocks |
| `<a href="...">` | `[text](url)` |
| `<img src="..." alt="...">` | `![alt](src)` |
| `<ul><li>` | `- item` / `* item` / `+ item` |
| `<ol><li>` | `1. item` |
| `<blockquote>` | `> quote` |
| `<hr>` | `---` / `***` / `___` |
| `<br>` | Line break |
| `<table>` | Basic GFM tables |

## Example

**Input HTML:**
```html
<h1>Welcome</h1>
<p>This is <strong>bold</strong> and <em>italic</em> text.</p>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
<pre><code>console.log("Hello");</code></pre>
```

**Output Markdown (ATX style):**
```markdown
# Welcome

This is **bold** and *italic* text.

- Item 1
- Item 2

```
console.log("Hello");
```
```

## Implementation Details

- Pure client-side conversion using regex-based transformations
- Handles HTML entity decoding (`<`, `>`, `&`, `&nbsp;`, etc.)
- Removes DOCTYPE, comments, and unsupported tags
- Cleans up excessive newlines in output
- No data leaves your browser