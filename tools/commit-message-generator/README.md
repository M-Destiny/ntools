# Commit Message Generator

Generate conventional commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Features

- **All standard commit types**: feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert
- **Visual type selector** with emojis and descriptions
- **Scope support** for component/module identification
- **Breaking changes** section with automatic `BREAKING CHANGE:` footer
- **Footer support** for issue references, co-authors, etc.
- **Real-time validation** checking description length, case, mood, and format
- **Copy to clipboard** with one click
- **Example templates** for quick start

## Usage

1. Select a commit type from the grid
2. Optionally add a scope (e.g., `auth`, `api`, `ui`)
3. Write a short description in imperative mood
4. Add optional body, breaking changes, and footer
5. Click "Generate Message" to preview
6. Copy the formatted commit message

## Validation Rules

- Description must be provided
- Description ≤ 100 characters
- No trailing period
- Lowercase description
- Imperative mood (add, fix, update, etc.)

## Example Output

```
✨ feat(auth): add OAuth2 login with Google provider

Implements OAuth2 flow with Google as identity provider.

- Adds GoogleStrategy to passport configuration
- Creates /auth/google and /auth/google/callback routes
- Stores refresh tokens securely in database
- Adds user profile sync on first login

Closes #123
Related: #456
```

## Conventional Commits Format

```
<type>[<scope>]: <description>

[<body>]

[BREAKING CHANGE: <description>]

[<footer>]
```