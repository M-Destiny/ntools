# Text Statistics

Analyze text with comprehensive statistics including character/word counts, reading time estimates, frequency analysis, and structural metrics.

## Features

- **Real-time analysis**: All statistics update instantly as you type
- **Character metrics**: Total, excluding spaces, excluding newlines
- **Word metrics**: Total words, unique words, longest/shortest word
- **Structure analysis**: Lines (total/non-empty), paragraphs, sentences
- **Line statistics**: Average, max, min line length
- **Time estimates**: Reading time (200 wpm), speaking time (130 wpm)
- **Frequency analysis**: Top 10 characters and words
- **Copy all stats**: One-click copy of complete analysis
- **Example loader**: Quick test with sample text

## Statistics Provided

| Category | Metrics |
|----------|---------|
| **Characters** | Total, no spaces, no newlines |
| **Words** | Total, unique, longest, shortest |
| **Structure** | Lines (total/non-empty), paragraphs, sentences |
| **Line Stats** | Average, maximum, minimum line length |
| **Estimates** | Reading time, speaking time |
| **Frequency** | Top 10 characters, top 10 words |

## Usage

1. Paste or type text into the input area
2. All statistics calculate automatically in real-time
3. Click "Copy All Stats" to copy the complete analysis
4. Use "Load Example" to test with sample text

## Technical Details

- Built with React 19 + TypeScript
- Word splitting on whitespace (Unicode-aware)
- Sentence splitting on `.`, `!`, `?` punctuation
- Paragraph splitting on double newlines
- Frequency analysis is case-insensitive for words; characters limited to a-z, 0-9
- Reading time: 200 words/minute (average adult silent reading)
- Speaking time: 130 words/minute (average speech rate)
- No external dependencies for analysis logic