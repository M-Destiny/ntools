# Timezone Converter

A tool to convert dates and times between different timezones with a live world clock.

## Features

- Convert any date/time between any two IANA timezones
- Searchable timezone dropdown with 400+ timezones
- Live world clock showing current time in multiple zones
- Offset display for each timezone
- Copy converted time to clipboard
- Swap source/destination timezones
- "Set to Now" button for quick current time conversion

## Usage

1. Select a date and time (defaults to now)
2. Choose source timezone (defaults to UTC)
3. Choose target timezone (defaults to your local timezone)
4. View the converted time instantly
5. Use the world clock to see current time in major cities

## Technical Details

- Uses `Intl.DateTimeFormat` for accurate timezone conversions
- Supports all IANA timezones via `Intl.supportedValuesOf('timeZone')`
- Live clock updates every second
- Handles DST transitions automatically
- No external dependencies

## Timezone Examples

| Timezone | Region | Offset |
|----------|--------|--------|
| UTC | Universal | +00:00 |
| America/New_York | US Eastern | -05:00/-04:00 |
| America/Los_Angeles | US Pacific | -08:00/-07:00 |
| Europe/London | UK | +00:00/+01:00 |
| Europe/Paris | Central Europe | +01:00/+02:00 |
| Asia/Tokyo | Japan | +09:00 |
| Australia/Sydney | Australia East | +10:00/+11:00 |