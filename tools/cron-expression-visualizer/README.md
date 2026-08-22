# Cron Expression Visualizer

## Description
A visual cron expression builder and validator. Enter a cron expression to see a human-readable description, field breakdown, and next scheduled run times.

## Usage
```tsx
import CronExpressionVisualizer from './tools/cron-expression-visualizer';
```

## Features
- Real-time cron expression validation
- Human-readable description of schedule
- Field-by-field breakdown with ranges
- Next 5 run times with relative time
- Preset buttons for common schedules
- Quick reference cheatsheet

## Supported Cron Format
- Standard 5-field: `minute hour day-of-month month day-of-week`
- Optional 6-field with year: `minute hour day-of-month month day-of-week year`
- Special characters: `*`, `*/n`, `a-b`, `a,b,c`, `?`, `L`, `W`, `#`

## Development
```bash
npm run dev
```