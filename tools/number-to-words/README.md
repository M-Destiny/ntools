# Number to Words Converter

Convert numbers to their English word representation.

## Features

- **Integer support**: Converts whole numbers up to quintillions
- **Decimal support**: Converts decimal numbers (e.g., 3.14 → "three point one four")
- **Negative numbers**: Handles negative values (e.g., -42 → "minus forty-two")
- **Large numbers**: Supports thousands, millions, billions, trillions, and beyond
- **Real-time conversion**: Updates as you type

## Usage

1. Enter a number in the input field
2. The word representation appears instantly in the output
3. Click "Copy Output" to copy the result

## Examples

| Input | Output |
|-------|--------|
| `42` | `forty-two` |
| `100` | `one hundred` |
| `1234` | `one thousand two hundred thirty-four` |
| `-56` | `minus fifty-six` |
| `3.14` | `three point one four` |
| `1000000` | `one million` |
| `1234567890` | `one billion two hundred thirty-four million five hundred sixty-seven thousand eight hundred ninety` |

## Implementation Details

- Client-side only, no server required
- Uses recursive algorithm for number grouping by thousands
- Handles edge cases: zero, negatives, decimals, very large numbers
- Built with React + TypeScript

## Component

```tsx
import NumberToWords from './tools/number-to-words';
```

The component is self-contained with no external dependencies beyond React.