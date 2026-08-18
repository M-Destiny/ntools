# ntools — Daily UI Tools Factory

Automated pipeline that builds **2 new React + TypeScript UI tools every day**.

## Structure
- `/tools` — Each tool is a self-contained component
- `/scripts` — Build and tracking helpers
- `progress.json` — Daily progress tracking

## Automation
- **Daily Build** (06:00): Researches, builds, commits 2 new tools
- **Monitor** (every 2h): Verifies progress, triggers catch-up if behind

## Tool Ideas Pool
Color picker, JSON formatter, Markdown preview, CSV-to-table, Regex tester, Gradient generator, Unit converter, QR code generator, Diff checker, Cron expression builder