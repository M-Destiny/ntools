# Mock Data Generator

Generate realistic mock data for testing, development, and prototyping. Define custom schemas with 15+ data types and export as JSON, CSV, SQL, or YAML.

## Features

- **15+ data types**: String, Number, Boolean, Date, Email, Name, Address, Phone, UUID, Lorem Ipsum, Color, URL, IP Address, Job Title, Company
- **Customizable options** per field (length, ranges, formats, etc.)
- **Multiple output formats**: JSON, CSV, SQL INSERT statements, YAML
- **Schema builder** — Add, remove, and configure fields visually
- **Data preview** — See first 10 rows in a table
- **Statistics** — Field count, row count, total values
- **Example schemas** — Quick start with realistic templates
- **Copy to clipboard** — One-click copy for all formats

## Data Types

| Type | Emoji | Description | Options | Example |
|------|-------|-------------|---------|---------|
| String | 🔤 | Random alphanumeric string | length | `aB3x9K` |
| Number | 🔢 | Random number in range | min, max, decimal | `42` |
| Boolean | ✅ | Random true/false | — | `true` |
| Date | 📅 | Random date in range | start, end | `2024-03-15` |
| Email | 📧 | Fake email address | — | `user@example.com` |
| Name | 👤 | Random person name | — | `John Smith` |
| Address | 🏠 | Fake street address | — | `123 Main St, City, ST 12345` |
| Phone | 📞 | Phone number | — | `+1 (555) 123-4567` |
| UUID | 🆔 | Random UUID v4 | — | `550e8400-e29b-41d4-a716-446655440000` |
| Lorem Ipsum | 📝 | Placeholder text | type (words/sentences/paragraphs), count | `Lorem ipsum dolor...` |
| Color | 🎨 | Random hex color | — | `#3b82f6` |
| URL | 🔗 | Fake website URL | — | `https://example.com/path` |
| IP Address | 🌐 | IPv4 or IPv6 address | version (v4/v6) | `192.168.1.1` |
| Job Title | 💼 | Random job title | — | `Senior Software Engineer` |
| Company | 🏢 | Fake company name | — | `Acme Corporation` |

## Output Formats

- **JSON** — Array of objects, perfect for APIs and JavaScript
- **CSV** — Comma-separated values, great for spreadsheets (optional headers)
- **SQL** — INSERT statements for database seeding
- **YAML** — Human-readable, good for config files

## Usage

1. **Define schema** — Add fields with names, types, and options
2. **Set row count** — How many records to generate (1-10,000)
3. **Choose format** — JSON, CSV, SQL, or YAML
4. **Generate** — Click "Generate Data"
5. **Preview & Copy** — View table preview and copy output

## Example Schema

```json
[
  { "name": "id", "type": "uuid" },
  { "name": "firstName", "type": "name" },
  { "name": "email", "type": "email" },
  { "name": "age", "type": "number", "options": { "min": 18, "max": 80 } },
  { "name": "isActive", "type": "boolean" },
  { "name": "createdAt", "type": "date", "options": { "start": "2023-01-01", "end": "2024-12-31" } },
  { "name": "role", "type": "job" },
  { "name": "company", "type": "company" }
]
```

## Use Cases

- **API testing** — Generate realistic request/response payloads
- **Database seeding** — SQL INSERT statements for dev databases
- **UI prototyping** — Populate tables, lists, forms with realistic data
- **Load testing** — Generate large datasets for performance tests
- **Documentation** — Example data for API docs and tutorials
- **Demo environments** — Quick realistic data for presentations