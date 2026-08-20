# Morse Code Translator

A tool to convert between text and Morse code.

## Features

- **Text to Morse**: Convert plain text to Morse code with proper spacing
- **Morse to Text**: Decode Morse code back to readable text
- **Real-time conversion**: Results update as you type
- **Copy output**: One-click copy to clipboard
- **Example loading**: Quick test with "SOS HELLO WORLD"
- **Swap direction**: Quickly switch between encode/decode modes
- **Reference table**: Built-in Morse code alphabet reference

## Usage

1. Select conversion direction (Text → Morse or Morse → Text)
2. Enter your input in the left pane
3. View the converted output in the right pane
4. Use "Copy Output" to copy results to clipboard

## Morse Code Format

- **Letters**: Separated by a single space
- **Words**: Separated by three spaces
- **Symbols**: Use `.` and `-` or `·` and `−` for dots and dashes

### Example

Text: `SOS HELLO WORLD`
Morse: `... --- ...   .... . .-.. .-.. ---   .-- --- .-. .-.. -..`

## Supported Characters

- Letters: A-Z
- Numbers: 0-9
- Punctuation: . , ? ' ! / ( ) & : ; = + - _ " $ @

## Technical Details

- Built with React + TypeScript
- No external dependencies
- Client-side only, works offline
- Real-time updates using React hooks