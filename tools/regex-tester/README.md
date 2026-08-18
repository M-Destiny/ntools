# Regex Tester

A powerful regular expression testing tool with live matching, syntax explanation, and built-in examples.

## Features

- **Live Pattern Testing** - Test regex patterns against input strings in real-time
- **Match Highlighting** - Visual highlighting of all matches in the test string
- **Detailed Match Information** - View match positions, capture groups, and named groups
- **Pattern Explanation** - Automatic breakdown of regex syntax with human-readable descriptions
- **Quick Examples** - Pre-built patterns for email, URL, phone, date, and IP validation
- **Flag Support** - Toggle global (g), case-insensitive (i), multiline (m), dotall (s), unicode (u), sticky (y) flags
- **Copy Results** - One-click copy of all matches with positions
- **Quick Test Badge** - Instant pass/fail indicator for pattern matching

## Usage

1. Enter a regex pattern in the Pattern field
2. Select desired flags (g, i, m, s, u, y)
3. Enter test string in the Test String area
4. View highlighted matches and detailed match information
5. Use "Copy Matches" to copy all match details

## Example Patterns

- **Email**: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- **URL**: `https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+`
- **Phone (US)**: `\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}`
- **Date (ISO)**: `\d{4}-\d{2}-\d{2}`
- **IPv4**: `\b(?:\d{1,3}\.){3}\d{1,3}\b`

## Keyboard Shortcuts

- Type in pattern/test string fields for live updates
- Click example buttons to load common patterns
- Click "Copy Matches" to copy all match results

## Technical Details

Built with React + TypeScript. Uses native JavaScript `RegExp` for pattern matching. No external dependencies.