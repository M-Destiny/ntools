# sitemap-generator

## Description
sitemap-generator - Generate XML sitemaps for search engines. Define URLs, set priorities, change frequencies, and lastmod dates. Parse existing sitemaps.

## Usage
```tsx
import SitemapGenerator from './tools/sitemap-generator';
```

## Features
- Generate XML sitemaps following sitemaps.org protocol (v0.9)
- Configure base URL, paths, change frequencies, and priorities
- Auto-generate lastmod dates (today's date)
- Homepage gets priority 1.0, others configurable (default 0.8)
- Include/exclude lastmod dates
- Quick-add common paths (blog, products, categories, etc.)
- Parse existing sitemap.xml files and display in table
- Load sample from robots.txt
- Copy to clipboard or download as .xml file
- Real-time generation as you type
- Validates base URL format
- Supports all changefreq values: always, hourly, daily, weekly, monthly, yearly, never

## Development
```bash
npm run dev
```