# UUID Generator

Generate UUIDs (Universally Unique Identifiers) in multiple versions.

## Features

- **v4 (Random)** — Cryptographically random UUIDs, most commonly used
- **v1 (Time-based)** — Timestamp + MAC address (RFC 4122)
- **v7 (Timestamp-sortable)** — Unix timestamp + random (RFC 9562 draft), sortable and privacy-friendly

## Usage

1. Select UUID version (v1, v4, or v7)
2. Choose count (1-100)
3. Click "Generate UUIDs" or enable auto-generate
4. Click any UUID to copy or view details

## Export

Download generated UUIDs as:
- `.txt` — One per line
- `.json` — Array with parsed metadata
- `.csv` — Spreadsheet format with version, variant, timestamp

## Version Comparison

| Feature | v1 | v4 | v7 |
|---------|-----|-----|-----|
| Source | Time + MAC | Random | Time + Random |
| Sortable | ✓ | ✗ | ✓ |
| Privacy | Leaks MAC | ✓ Anonymous | ✓ Anonymous |
| Collision Risk | Low* | Negligible | Negligible |
| RFC | 4122 | 4122 | 9562 (draft) |

* v1 collisions possible if clock moves backward or MAC not unique

## When to Use Which

- **v4** — General purpose, database keys, session IDs, no ordering needed
- **v7** — Database primary keys (better index locality), event sourcing, time-ordered logs
- **v1** — Legacy systems requiring RFC 4122 v1

## Format

`xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx`

- M = version (1, 4, or 7)
- N = variant (8, 9, a, b for RFC 4122)