# Number Base Converter

Convert numbers between binary, octal, decimal, and hexadecimal bases with instant real-time conversion.

## Features

- **4 base support**: Binary (base 2), Octal (base 8), Decimal (base 10), Hexadecimal (base 16)
- **Real-time conversion**: All bases update instantly as you type
- **Prefix support**: Recognizes `0b`, `0o`, `0x` prefixes automatically
- **Underscore separators**: Ignores underscores for readability (e.g., `0xFF_EE_DD`)
- **Copy to clipboard**: One-click copy for each output format
- **Input validation**: Clear error messages for invalid input
- **Example loader**: Quick test with common values

## Usage

1. Select your input base (Binary, Octal, Decimal, or Hexadecimal)
2. Enter a number in the input field
3. All other bases update automatically
4. Click the copy button (📋) next to any output to copy to clipboard

## Supported Formats

| Base | Prefix | Digits | Example |
|------|--------|--------|---------|
| Binary | `0b` | 0-1 | `0b11111111` |
| Octal | `0o` | 0-7 | `0o377` |
| Decimal | (none) | 0-9 | `255` |
| Hexadecimal | `0x` | 0-9, A-F | `0xFF` |

## Technical Details

- Built with React 19 + TypeScript
- Uses native JavaScript `parseInt()` and `toString()` for conversion
- Handles up to `Number.MAX_SAFE_INTEGER` (2^53 - 1)
- No external dependencies for base conversion logic