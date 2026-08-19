# cron-builder

## Description
Interactive cron expression builder with visual field selectors, presets, human-readable descriptions, and next-run predictions.

## Usage
```tsx
import CronBuilder from './tools/cron-builder';
```

## Features
- Visual field-by-field cron expression builder (minute, hour, day of month, month, day of week)
- Dropdown selectors with common values + custom text input for advanced patterns
- Quick-pick buttons for common values per field
- 12 built-in presets (every minute, hourly, daily, weekly, monthly, weekdays, weekends, etc.)
- Real-time human-readable schedule description
- Next 5 estimated run times preview
- Copy expression to clipboard
- Full cron syntax reference with examples
- Supports standard cron syntax: `*`, `*/n`, `a-b`, `a,b,c`, `a-b/n`, `L`, `W`, `#`

## Development
```bash
npm run dev
```