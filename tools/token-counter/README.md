# Token Counter

## Description
Token Counter - Count tokens, words, characters, and estimate API costs for various LLM models including GPT-4, GPT-3.5, Claude 3, Llama 3, and custom estimations.

## Usage
```tsx
import TokenCounter from './tools/token-counter';
```

## Features
- Token counting for multiple LLM models (GPT-4, GPT-3.5, Claude 3, Llama 3)
- Word, character, line, sentence, and paragraph counting
- Context window usage visualization with progress bar
- API cost estimation for input/output tokens across major providers
- Model comparison table showing tokenization differences
- Load example texts (Lorem Ipsum, code, JSON, long text)
- Custom tokenizer support via regex
- Educational info about tokenization

## Development
```bash
npm run dev
```