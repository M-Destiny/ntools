# Text Case Converter

Convert text between 13 different case formats instantly.

## Features

- **13 case formats**: lowercase, UPPERCASE, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case, Header-Case, Capitalize
- **Live preview**: See all conversions at once with "Show All Cases"
- **Sample inputs**: Quick-load common test strings
- **Copy individual or all results**: One-click copy for any format
- **Character/word count**: Track input and output stats

## Usage

1. Enter or paste text in the input area
2. Click a case format button to select output style
3. Copy the result or toggle "Show All Cases" to see every format

## Case Format Reference

| Format | Example | Use Case |
|--------|---------|----------|
| lowercase | `hello world` | General text |
| UPPERCASE | `HELLO WORLD` | Constants, headers |
| Title Case | `Hello World` | Titles, headings |
| Sentence case | `Hello world` | Sentences, UI labels |
| camelCase | `helloWorld` | JavaScript variables |
| PascalCase | `HelloWorld` | Classes, components |
| snake_case | `hello_world` | Python, SQL, config |
| kebab-case | `hello-world` | URLs, CSS, CLI |
| CONSTANT_CASE | `HELLO_WORLD` | Env vars, constants |
| dot.case | `hello.world` | DNS, packages |
| path/case | `hello/world` | File paths, routes |
| Header-Case | `Hello-World` | HTTP headers |
| Capitalize | `Hello world` | First word only |

## Technical Details

- Built with React 19 + TypeScript
- No external dependencies for case conversion
- Handles Unicode and special characters
- Splits on spaces, underscores, hyphens, and dots