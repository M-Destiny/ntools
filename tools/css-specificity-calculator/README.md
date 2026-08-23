# css-specificity-calculator

## Description
Calculate and compare CSS selector specificity. Enter one selector per line to see their specificity scores broken down by IDs, classes/attributes/pseudo-classes, and elements.

## Usage
```tsx
import CSSSpecificityCalculator from './tools/css-specificity-calculator';
```

## Features
- Calculate specificity for multiple selectors at once (one per line)
- Shows breakdown: IDs, Classes/Attributes/Pseudo-classes, Elements
- Numeric score for easy comparison
- Identifies selector with highest specificity
- Handles selector groups (comma-separated)
- Supports pseudo-classes (:hover, :focus, :nth-child, etc.)
- Supports pseudo-elements (::before, ::after)
- Supports attribute selectors ([type="text"])
- Special handling for :where(), :is(), :not(), :has()
- Example selectors included for quick testing
- Copy all results to clipboard

## Development
```bash
npm run dev
```