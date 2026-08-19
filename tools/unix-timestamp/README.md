# Unix Timestamp Converter

Convert between Unix timestamps (seconds/milliseconds) and human-readable dates with support for multiple formats.

## Features

- **Bidirectional conversion** — Unix timestamp ↔ human-readable date
- **Auto-detection** — Handles both seconds (10 digits) and milliseconds (13 digits)
- **Multiple input formats** — ISO 8601, RFC 2822, US format, and more
- **Timezone support** — Local timezone and UTC
- **Live current time** — Real-time clock showing current timestamp
- **Copy all formats** — One-click copy of all representations
- **Quick examples** — Epoch, Y2K, now, ISO, RFC 2822 presets

## Supported Formats

### Unix Timestamps
- Seconds: `1724068800`
- Milliseconds: `1724068800000`

### Date Strings
- ISO 8601: `2026-08-19T12:00:00Z`
- RFC 2822: `Wed, 19 Aug 2026 12:00:00 GMT`
- US: `08/19/2026 12:00:00`
- Natural: `Aug 19 2026 12:00:00`

## Output Formats

| Format | Example |
|--------|---------|
| Unix (seconds) | `1724068800` |
| Unix (milliseconds) | `1724068800000` |
| ISO 8601 | `2026-08-19T12:00:00.000Z` |
| RFC 2822 | `Wed, 19 Aug 2026 12:00:00 GMT` |
| Readable | `Wednesday, August 19, 2026 12:00:00 UTC` |

## Component

`/tools/unix-timestamp/index.tsx` — React + TypeScript component with live updates.

## Usage

```tsx
import UnixTimestamp from '../tools/unix-timestamp';
<UnixTimestamp />
```

## Development

```bash
npm run dev
# Visit /tools/unix-timestamp
```