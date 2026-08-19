# password-generator

## Description
password-generator - A cryptographically secure password generator built with React + TypeScript. Uses Web Crypto API for true randomness.

## Usage
```tsx
import PasswordGenerator from './tools/password-generator';
```

## Features
- Cryptographically secure random generation using `crypto.getRandomValues()`
- Customizable length (4-128 characters)
- Configurable character sets: uppercase, lowercase, numbers, symbols
- Option to exclude similar characters (i, l, 1, L, o, 0, O)
- Option to exclude ambiguous characters ({ } [ ] ( ) < > ' " , ; : \ | ~ `)
- Real-time password strength meter
- Quick generate multiple passwords (1, 5, 10)
- History of recently generated passwords
- Copy to clipboard with visual feedback
- No server communication - all generation happens in browser

## Development
```bash
npm run dev
```