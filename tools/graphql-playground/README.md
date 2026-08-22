# GraphQL Playground

## Description
A full-featured GraphQL IDE for testing queries against any GraphQL endpoint. Supports variables, custom headers, query history, multiple example APIs, and dark/light theme.

## Features
- **Query Editor** - Syntax-highlighted GraphQL query editor
- **Variables Panel** - JSON variables input with validation
- **Headers Panel** - Custom HTTP headers (auth, content-type, etc.)
- **Any Endpoint** - Works with any GraphQL API (public or private)
- **Response Viewer** - Formatted JSON response with error handling
- **Query History** - Last 50 queries saved to localStorage
- **Example APIs** - Pre-loaded: GitHub, Rick & Morty, Countries, Star Wars
- **Dark/Light Theme** - Toggle with persistence
- **Query Prettify** - Format queries with one click
- **Copy Response** - Copy JSON to clipboard
- **Responsive** - Side-by-side on desktop, stacked on mobile

## Usage
```tsx
import GraphQLPlayground from './tools/graphql-playground';

function App() {
  return <GraphQLPlayground />;
}
```

## Default Endpoint
Uses `https://graphqlzero.almansi.dev/api` by default (a public GraphQL test API).

## Example APIs Included
| API | Endpoint | Description |
|-----|----------|-------------|
| GitHub | `https://api.github.com/graphql` | Requires auth token |
| Rick & Morty | `https://rickandmortyapi.com/graphql` | Character/episode data |
| Countries | `https://countries.trevorblades.com/` | Country information |
| Star Wars | `https://swapi-graphql.netlify.app/.netlify/functions/index` | SWAPI GraphQL wrapper |

## Development
```bash
npm run dev
```

## Keyboard Shortcuts
- `Ctrl/Cmd + Enter` - Execute query (when focused in editor)
- `Ctrl/Cmd + S` - Save to history (automatic on execute)
- Tab - Indentation in editors

## Notes
- History is stored in localStorage (persists across sessions)
- Theme preference is saved to localStorage
- CORS must be enabled on the target GraphQL endpoint
- For private APIs, add Authorization header in Headers tab