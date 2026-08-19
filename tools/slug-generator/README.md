# Slug Generator

Create URL-friendly slugs from text with configurable options.

## Features

- **Multiple separators** — kebab-case, snake_case, dot, tilde, or none
- **Case handling** — Lowercase, preserve case, or convert variants
- **Stopword removal** — Automatically remove common words (a, the, and, etc.)
- **Unicode support** — Preserve accents or convert to ASCII
- **Length limiting** — Truncate to max character count
- **Custom replacements** — Define your own character mappings
- **Format variants** — Preview as camelCase, PascalCase, UPPER_CASE, etc.
- **History** — Reuse recent slugs

## Usage

1. Enter text in the input area
2. Configure options (separator, casing, stopwords, etc.)
3. Copy the generated slug or click a variant
4. Use history to reuse recent slugs

## Options

| Option | Description |
|--------|-------------|
| Separator | Character between words (`-`, `_`, `.`, `~`, or none) |
| Lowercase | Convert to lowercase (recommended for URLs) |
| Remove stopwords | Strip common words like "a", "the", "and" |
| Preserve Unicode | Keep accented characters (café → café vs cafe) |
| Strict mode | Remove all special characters |
| Max length | Truncate slug to N characters |

## Custom Replacements

Define custom mappings for special characters:
- `&` → `and`
- `@` → `at`
- `#` → `hash`
- `$` → `dollar`
- etc.

## Format Variants

The tool shows your slug in multiple formats:
- `kebab-case` — blog-post-title (default, Google-recommended)
- `snake_case` — blog_post_title (APIs, Python)
- `camelCase` — blogPostTitle (JavaScript variables)
- `PascalCase` — BlogPostTitle (React components)
- `UPPER_CASE` — BLOG_POST_TITLE (constants)
- `noseparator` — blogposttitle (shortest)

## Best Practices

- **Use kebab-case** for URLs — Google recommends it
- **Keep under 60 chars** — Full visibility in search results
- **Lowercase always** — Avoids case-sensitivity issues on Linux
- **Remove stopwords** for brevity, but verify meaning isn't lost
- **Custom replacements** for brand terms (`&` → `and`, `@` → `at`)