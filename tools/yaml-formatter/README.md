# YAML Formatter

A developer tool for formatting, validating, and pretty-printing YAML files.

## Features

- **Format YAML** - Pretty-print with customizable indentation (2, 4, or 1 space)
- **Validate YAML** - Real-time parsing with error messages
- **Sort Keys** - Optionally sort object keys alphabetically
- **Copy/Download** - Copy formatted output or download as `.yaml` file
- **Load Example** - Quick start with a sample YAML document

## Usage

1. Paste YAML in the input pane
2. Adjust indentation and key sorting options
3. View formatted output in real-time
4. Copy or download the result

## Keyboard Shortcuts

- `Ctrl+Enter` - Format (auto-formats on change)
- `Ctrl+C` - Copy output (when output focused)

## Technical Details

- Pure client-side YAML parser (no external dependencies)
- Handles strings, numbers, booleans, null, arrays, and nested objects
- Preserves YAML types (boolean, null, numbers)
- Auto-quotes strings with special characters
- Supports multi-line strings

## Example Input

```yaml
name: John Doe
age: 30
active: true
tags:
  - developer
  - designer
address:
  street: 123 Main St
  city: San Francisco
```