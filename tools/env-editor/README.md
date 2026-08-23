# .env File Editor

## Description
Parse, edit, and generate .env files with a table UI. Create .env.example templates by stripping values.

## Usage
```tsx
import EnvEditor from './tools/env-editor';
```

## Features
- Parse .env files into editable table
- Add/remove environment variables
- Switch between raw editor and table view
- Generate .env.example templates (keys only, values stripped)
- Load example configurations
- Copy to clipboard
- Alphabetical sorting in table view

## Development
```bash
npm run dev
```