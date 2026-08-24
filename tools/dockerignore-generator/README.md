# .dockerignore Generator

Generate a comprehensive `.dockerignore` file for your Docker builds. Select patterns to exclude from the build context to speed up builds and avoid copying unnecessary files.

## Features

- **Categorized patterns** — Organized by Dependencies, Build Outputs, IDE/Editor, Logs, Test/Coverage, Environment, Docker, Git, and Secrets/Certs
- **Select all/none per category** — Quickly enable or disable entire categories
- **Custom patterns** — Add your own patterns
- **Live preview** — See the generated output in real-time
- **Copy & Download** — Copy to clipboard or download as `.dockerignore`

## Usage

1. Select the patterns you want to include (defaults are sensible for most projects)
2. Add any custom patterns
3. Click "Generate" to preview
4. Copy to clipboard or download the file

## Why use .dockerignore?

- **Faster builds** — Excludes large directories like `node_modules`, `vendor`, `dist`, `.git`
- **Smaller images** — Prevents build artifacts and secrets from being copied
- **Security** — Keeps `.env`, `*.pem`, `*.key`, certificates out of images
- **Consistency** — Ensures reproducible builds across environments