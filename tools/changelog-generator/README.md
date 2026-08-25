# Changelog Generator

Create professional changelogs following the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format with [Semantic Versioning](https://semver.org/).

## Features

- **Multiple releases** — Manage multiple versions in one document
- **Standard change types**: Added, Changed, Deprecated, Removed, Fixed, Security
- **Rich metadata** — PR/Issue numbers, author attribution
- **Two output formats**: Markdown (human-readable) and JSON (machine-readable)
- **Drag-and-drop ready** — Add/remove releases and changes easily
- **Statistics summary** — Count changes by type across all releases
- **Example data** — Quick start with realistic sample changelog
- **Copy to clipboard** — One-click copy for both formats

## Usage

1. **Add releases** using the `+` tab button
2. **Set version** (e.g., `2.1.0`) and **release date** for each
3. **Add changes** by clicking type buttons (✨ Added, 🔄 Changed, etc.)
4. **Fill in details**: description, PR number, author
5. **Choose format**: Markdown or JSON
6. **Generate** and copy the result

## Change Types

| Type | Emoji | Description |
|------|-------|-------------|
| Added | ✨ | New features |
| Changed | 🔄 | Changes in existing functionality |
| Deprecated | ⚠️ | Soon-to-be removed features |
| Removed | 🗑️ | Now removed features |
| Fixed | 🐛 | Bug fixes |
| Security | 🔒 | Vulnerability fixes |

## Example Output (Markdown)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2024-01-15

### ✨ Added
- Add dark mode toggle in settings (#123 — @johndoe)
- Support for custom themes via CSS variables (#125 — @janedoe)

### 🔄 Changed
- Improve keyboard navigation in modal dialogs (#118 — @johndoe)

### 🐛 Fixed
- Fix memory leak in WebSocket connection handler (#120 — @bobsmith)
- Correct timestamp parsing in UTC timezone (#122 — @alicechen)

### 🔒 Security
- Update dependencies to patch CVE-2024-12345 (#124 — @security-bot)

## [2.0.0] - 2024-01-15

### ✨ Added
- Complete rewrite of authentication system (#100 — @johndoe)
- New plugin architecture for extensions (#105 — @janedoe)

### 🔄 Changed
- Migrate from REST to GraphQL API (#95 — @bobsmith)

### ⚠️ Deprecated
- Deprecate legacy v1 API endpoints (#98 — @johndoe)

### 🗑️ Removed
- Remove support for IE11 (#110 — @alicechen)

### 🐛 Fixed
- Fix race condition in cache invalidation (#88 — @bobsmith)
```

## Example Output (JSON)

```json
[
  {
    "version": "2.1.0",
    "date": "2024-01-15",
    "changes": [
      {
        "type": "added",
        "description": "Add dark mode toggle in settings",
        "pr": "123",
        "author": "johndoe"
      },
      {
        "type": "fixed",
        "description": "Fix memory leak in WebSocket connection handler",
        "pr": "120",
        "author": "bobsmith"
      }
    ]
  }
]
```

## Best Practices

- Group changes by **type**, not by commit or PR
- Use **imperative mood**: "Add feature" not "Added feature"
- Link to PRs/issues: `(#123)`
- Credit authors: `— @username`
- Order releases **newest first**
- Use "Unreleased" section for upcoming changes
- Follow Semantic Versioning for version numbers