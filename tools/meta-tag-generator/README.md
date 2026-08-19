# Meta Tag Generator

Generate HTML meta tags for SEO, Open Graph, Twitter Cards, and more. Export as HTML, JSON, or React Helmet code.

## Features

- **Four categories**: Basic SEO, Open Graph, Twitter Cards, Advanced
- **Presets**: Blog Post, Product Page, Minimal
- **Validation checklist**: Real-time SEO validation
- **Three export formats**: HTML, JSON, React Helmet
- **Copy to clipboard**: One-click copy with visual feedback
- **Smart fallbacks**: OG/Twitter fields fall back to basic SEO fields

## Usage

1. Fill in fields across the four tabs
2. Use presets for quick starts
3. Watch validation checklist update in real-time
4. Switch output format (HTML/JSON/React)
5. Click "Copy to Clipboard"

## Tabs

| Tab | Contents |
|-----|----------|
| Basic SEO | Title, description, canonical, author, keywords, robots, language, rating, generator, referrer |
| Open Graph | og:title, og:description, og:image, og:url, og:type, og:site_name |
| Twitter Cards | twitter:card, twitter:site, twitter:creator, twitter:title, twitter:description, twitter:image |
| Advanced | charset, viewport, theme-color |

## Export Formats

- **HTML** — Ready to paste into `<head>`
- **JSON** — For programmatic use
- **React Helmet** — For `react-helmet-async` integration

## Validation Checklist

- Title length (30-60 chars)
- Description length (120-160 chars)
- Open Graph title/description/image present
- Twitter card type set
- Canonical URL present
- Viewport meta tag present

## Technical

- Built with React + TypeScript
- No external dependencies (escapeHtml is built-in)
- Runs entirely client-side