# Lorem Ipsum Generator

Generate placeholder text for designs, mockups, and testing.

## Features

- **Four output types**: paragraphs, words, sentences, or bytes
- **Customizable count**: slider + preset buttons for common sizes
- **Classic start**: Optionally begin with "Lorem ipsum dolor sit amet..."
- **HTML output**: Wrap paragraphs in `<p>` tags
- **Copy to clipboard**: One-click copy with visual feedback
- **History**: Recent outputs saved for reuse
- **Live stats**: Word count, character count, paragraph count

## Usage

1. Select output type (Paragraphs / Words / Sentences / Bytes)
2. Choose count via slider or preset buttons
3. Toggle options as needed
4. Click "Generate" or watch live updates
5. Click "Copy to Clipboard" to copy

## Output Types

| Type | Best For |
|------|----------|
| Paragraphs | Layout mockups, CMS placeholders |
| Words | Exact word count requirements |
| Sentences | Testing punctuation handling |
| Bytes | File upload limits, DB field sizes |

## Technical

- Built with React + TypeScript
- No external dependencies
- Uses Web Crypto API for randomization
- Runs entirely client-side