import React, { useState, Suspense, lazy, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import './App.css';

// Types
interface ToolMeta {
  name: string;
  displayName: string;
  description: string;
  category: string;
  component: React.ComponentType;
  icon?: React.ReactNode;
  shortcut?: string;
}

// Category config
const CATEGORY_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  Design: { color: 'var(--color-cat-design)', bg: 'var(--color-cat-design-bg)', icon: '🎨' },
  Developer: { color: 'var(--color-cat-developer)', bg: 'var(--color-cat-developer-bg)', icon: '⚙️' },
  Data: { color: 'var(--color-cat-data)', bg: 'var(--color-cat-data-bg)', icon: '📊' },
  Utility: { color: 'var(--color-cat-utility)', bg: 'var(--color-cat-utility-bg)', icon: '🛠️' },
};

// Tool registry
const TOOL_REGISTRY: Record<string, ToolMeta> = {
  'color-picker': {
    name: 'color-picker',
    displayName: 'Color Picker',
    description: 'Pick colors from anywhere on screen, get hex/rgb/hsl values, build palettes',
    category: 'Design',
    component: lazy(() => import('../tools/color-picker').then(m => ({ default: m.default }))),
    icon: '🎨',
    shortcut: 'C'
  },
  'json-formatter': {
    name: 'json-formatter',
    displayName: 'JSON Formatter',
    description: 'Format, validate, minify, and prettify JSON with syntax highlighting',
    category: 'Developer',
    component: lazy(() => import('../tools/json-formatter').then(m => ({ default: m.default }))),
    icon: '📝',
    shortcut: 'J'
  },
  'markdown-preview': {
    name: 'markdown-preview',
    displayName: 'Markdown Preview',
    description: 'Live markdown editor with real-time HTML preview, syntax highlighting, and export options',
    category: 'Developer',
    component: lazy(() => import('../tools/markdown-preview').then(m => ({ default: m.default }))),
    icon: '📄',
    shortcut: 'M'
  },
  'csv-to-table': {
    name: 'csv-to-table',
    displayName: 'CSV to Table',
    description: 'Parse CSV data into a sortable, filterable table with pagination. Export as Markdown, JSON, or CSV.',
    category: 'Data',
    component: lazy(() => import('../tools/csv-to-table').then(m => ({ default: m.default }))),
    icon: '📊',
    shortcut: 'C'
  },
  'regex-tester': {
    name: 'regex-tester',
    displayName: 'Regex Tester',
    description: 'Test and debug regular expressions with live matching, syntax explanation, and examples.',
    category: 'Developer',
    component: lazy(() => import('../tools/regex-tester').then(m => ({ default: m.default }))),
    icon: '🔍',
    shortcut: 'R'
  },
  'gradient-generator': {
    name: 'gradient-generator',
    displayName: 'Gradient Generator',
    description: 'Create beautiful CSS gradients — linear, radial, and conic. Export ready-to-use CSS code.',
    category: 'Design',
    component: lazy(() => import('../tools/gradient-generator').then(m => ({ default: m.default }))),
    icon: '🌈',
    shortcut: 'G'
  },
  'unit-converter': {
    name: 'unit-converter',
    displayName: 'Unit Converter',
    description: 'Convert between units across 10 categories — length, weight, temperature, volume, area, speed, time, data, pressure, energy.',
    category: 'Utility',
    component: lazy(() => import('../tools/unit-converter').then(m => ({ default: m.default }))),
    icon: '📏',
    shortcut: 'U'
  },
  'qr-code-generator': {
    name: 'qr-code-generator',
    displayName: 'QR Code Generator',
    description: 'Generate QR codes for URLs, text, contacts, WiFi, and more. Customize colors, size, error correction, and add a logo.',
    category: 'Utility',
    component: lazy(() => import('../tools/qr-code-generator').then(m => ({ default: m.default }))),
    icon: '📱',
    shortcut: 'Q'
  },
  'diff-checker': {
    name: 'diff-checker',
    displayName: 'Diff Checker',
    description: 'Compare two text blocks and visualize differences with side-by-side or unified view. Line-by-line diff with syntax highlighting.',
    category: 'Developer',
    component: lazy(() => import('../tools/diff-checker').then(m => ({ default: m.default }))),
    icon: '🔀',
    shortcut: 'D'
  },
  'base64-encoder': {
    name: 'base64-encoder',
    displayName: 'Base64 Encoder/Decoder',
    description: 'Encode text or files to Base64, decode Base64 back to text. Supports UTF-8 and binary files with file upload.',
    category: 'Utility',
    component: lazy(() => import('../tools/base64-encoder').then(m => ({ default: m.default }))),
    icon: '🔐',
    shortcut: 'B'
  },
  'cron-builder': {
    name: 'cron-builder',
    displayName: 'Cron Expression Builder',
    description: 'Build and test cron expressions visually with field selectors, presets, human-readable descriptions, and next-run predictions.',
    category: 'Utility',
    component: lazy(() => import('../tools/cron-builder').then(m => ({ default: m.default }))),
    icon: '⏰',
    shortcut: 'C'
  },
  'jwt-decoder': {
    name: 'jwt-decoder',
    displayName: 'JWT Decoder',
    description: 'Decode, inspect, and verify JSON Web Tokens with header/payload inspection, signature verification, and timestamp humanization.',
    category: 'Developer',
    component: lazy(() => import('../tools/jwt-decoder').then(m => ({ default: m.default }))),
    icon: '🔑',
    shortcut: 'J'
  },
  'unix-timestamp': {
    name: 'unix-timestamp',
    displayName: 'Unix Timestamp Converter',
    description: 'Convert between Unix timestamps (seconds/ms) and human-readable dates. Supports ISO 8601, RFC 2822, and custom formats.',
    category: 'Utility',
    component: lazy(() => import('../tools/unix-timestamp').then(m => ({ default: m.default }))),
    icon: '🕐',
    shortcut: 'T'
  },
  'color-contrast': {
    name: 'color-contrast',
    displayName: 'Color Contrast Checker',
    description: 'Check WCAG contrast ratios between foreground and background colors. Test AA and AAA compliance for normal and large text.',
    category: 'Design',
    component: lazy(() => import('../tools/color-contrast').then(m => ({ default: m.default }))),
    icon: '♿',
    shortcut: 'A'
  },
  'password-generator': {
    name: 'password-generator',
    displayName: 'Password Generator',
    description: 'Generate cryptographically secure passwords with customizable options. Uses Web Crypto API for true randomness.',
    category: 'Utility',
    component: lazy(() => import('../tools/password-generator').then(m => ({ default: m.default }))),
    icon: '🔒',
    shortcut: 'P'
  },
  'qr-scanner': {
    name: 'qr-scanner',
    displayName: 'QR Code Scanner',
    description: 'Scan QR codes using your camera or upload an image. Real-time scanning with Barcode Detection API.',
    category: 'Utility',
    component: lazy(() => import('../tools/qr-scanner').then(m => ({ default: m.default }))),
    icon: '📷',
    shortcut: 'S'
  },
  'number-base-converter': {
    name: 'number-base-converter',
    displayName: 'Number Base Converter',
    description: 'Convert numbers between binary, octal, decimal, and hexadecimal with instant real-time conversion.',
    category: 'Utility',
    component: lazy(() => import('../tools/number-base-converter').then(m => ({ default: m.default }))),
    icon: '🔢',
    shortcut: 'N'
  },
  'text-statistics': {
    name: 'text-statistics',
    displayName: 'Text Statistics',
    description: 'Analyze text with comprehensive statistics: character/word counts, reading time, frequency analysis, and more.',
    category: 'Utility',
    component: lazy(() => import('../tools/text-statistics').then(m => ({ default: m.default }))),
    icon: '📈',
    shortcut: 'T'
  },
  'lorem-ipsum-generator': {
    name: 'lorem-ipsum-generator',
    displayName: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text in paragraphs, words, sentences, or bytes. Optionally start with classic Lorem ipsum and wrap in HTML.',
    category: 'Utility',
    component: lazy(() => import('../tools/lorem-ipsum-generator').then(m => ({ default: m.default }))),
    icon: '📝',
    shortcut: 'L'
  },
  'meta-tag-generator': {
    name: 'meta-tag-generator',
    displayName: 'Meta Tag Generator',
    description: 'Generate HTML meta tags for SEO, Open Graph, Twitter Cards, and more. Export as HTML, JSON, or React Helmet code.',
    category: 'Developer',
    component: lazy(() => import('../tools/meta-tag-generator').then(m => ({ default: m.default }))),
    icon: '🏷️',
    shortcut: 'M'
  },
  'timezone-converter': {
    name: 'timezone-converter',
    displayName: 'Timezone Converter',
    description: 'Convert dates and times between any timezones with live world clock and DST handling.',
    category: 'Utility',
    component: lazy(() => import('../tools/timezone-converter').then(m => ({ default: m.default }))),
    icon: '🌍',
    shortcut: 'Z'
  },
  'favicon-generator': {
    name: 'favicon-generator',
    displayName: 'Favicon Generator',
    description: 'Generate favicon files in multiple sizes from a single image. Supports PNG, transparent backgrounds, and Apple touch icons.',
    category: 'Design',
    component: lazy(() => import('../tools/favicon-generator').then(m => ({ default: m.default }))),
    icon: '🌐',
    shortcut: 'F'
  },
  'code-formatter': {
    name: 'code-formatter',
    displayName: 'Code Formatter',
    description: 'Beautify or minify JavaScript, TypeScript, JSON, CSS, HTML, Markdown, YAML, XML, SQL, and Python with configurable indentation.',
    category: 'Developer',
    component: lazy(() => import('../tools/code-formatter').then(m => ({ default: m.default }))),
    icon: '💅',
    shortcut: 'F'
  },
  'regex-explainer': {
    name: 'regex-explainer',
    displayName: 'Regex Explainer',
    description: 'Break down regular expressions into plain English explanations with live matching, capture groups, and examples.',
    category: 'Developer',
    component: lazy(() => import('../tools/regex-explainer').then(m => ({ default: m.default }))),
    icon: '📖',
    shortcut: 'E'
  },
  'json-validator': {
    name: 'json-validator',
    displayName: 'JSON Validator & Formatter',
    description: 'Validate, format, and prettify JSON with syntax error detection and example templates.',
    category: 'Developer',
    component: lazy(() => import('../tools/json-validator').then(m => ({ default: m.default }))),
    icon: '✅',
    shortcut: 'V'
  },
  'css-shadow-generator': {
    name: 'css-shadow-generator',
    displayName: 'CSS Shadow Generator',
    description: 'Create complex box-shadow effects with multiple layers. Build subtle depth, neon glows, or brutalist shadows visually.',
    category: 'Design',
    component: lazy(() => import('../tools/css-shadow-generator').then(m => ({ default: m.default }))),
    icon: '🌫️',
    shortcut: 'S'
  },
  'json-to-typescript': {
    name: 'json-to-typescript',
    displayName: 'JSON to TypeScript',
    description: 'Convert JSON to TypeScript interfaces or type aliases with configurable options.',
    category: 'Developer',
    component: lazy(() => import('../tools/json-to-typescript').then(m => ({ default: m.default }))),
    icon: '🔷',
    shortcut: 'T'
  },
  'html-to-markdown': {
    name: 'html-to-markdown',
    displayName: 'HTML to Markdown',
    description: 'Convert HTML to clean Markdown with configurable output style. Supports headings, lists, tables, code blocks, and more.',
    category: 'Developer',
    component: lazy(() => import('../tools/html-to-markdown').then(m => ({ default: m.default }))),
    icon: '🔄',
    shortcut: 'H'
  },
  'css-animation-generator': {
    name: 'css-animation-generator',
    displayName: 'CSS Animation Generator',
    description: 'Create custom CSS keyframe animations and transitions visually with 8 presets. Export production-ready CSS code.',
    category: 'Design',
    component: lazy(() => import('../tools/css-animation-generator').then(m => ({ default: m.default }))),
    icon: '✨',
    shortcut: 'A'
  },
  'color-scheme-generator': {
    name: 'color-scheme-generator',
    displayName: 'Color Scheme Generator',
    description: 'Generate harmonious color palettes from a base color using color theory. Export as CSS, Tailwind, SCSS, or JSON.',
    category: 'Design',
    component: lazy(() => import('../tools/color-scheme-generator').then(m => ({ default: m.default }))),
    icon: '🎭',
    shortcut: 'S'
  },
  'emoji-picker': {
    name: 'emoji-picker',
    displayName: 'Emoji Picker',
    description: 'Browse, search, and copy 1800+ emojis across 9 categories with recent history and instant clipboard copy.',
    category: 'Utility',
    component: lazy(() => import('../tools/emoji-picker').then(m => ({ default: m.default }))),
    icon: '😀',
    shortcut: 'E'
  },
  'markdown-linter': {
    name: 'markdown-linter',
    displayName: 'Markdown Linter',
    description: 'Lint Markdown with 15+ rules. Auto-fix trailing spaces, heading issues, formatting violations, and more.',
    category: 'Developer',
    component: lazy(() => import('../tools/markdown-linter').then(m => ({ default: m.default }))),
    icon: '🔍',
    shortcut: 'L'
  },
  'csv-to-json': {
    name: 'csv-to-json',
    displayName: 'CSV to JSON',
    description: 'Convert CSV data to JSON with configurable parsing options. Handles headers, delimiters, and type inference.',
    category: 'Data',
    component: lazy(() => import('../tools/csv-to-json').then(m => ({ default: m.default }))),
    icon: '🔄',
    shortcut: 'C'
  },
  'json-to-csv': {
    name: 'json-to-csv',
    displayName: 'JSON to CSV',
    description: 'Convert JSON arrays to CSV with configurable field selection, delimiters, and header options.',
    category: 'Data',
    component: lazy(() => import('../tools/json-to-csv').then(m => ({ default: m.default }))),
    icon: '🔄',
    shortcut: 'J'
  },
  'markdown-table-generator': {
    name: 'markdown-table-generator',
    displayName: 'Markdown Table Generator',
    description: 'Create and format Markdown tables visually. Add rows, columns, alignment, and export clean Markdown.',
    category: 'Developer',
    component: lazy(() => import('../tools/markdown-table-generator').then(m => ({ default: m.default }))),
    icon: '📋',
    shortcut: 'T'
  },
  'markdown-link-checker': {
    name: 'markdown-link-checker',
    displayName: 'Markdown Link Checker',
    description: 'Scan Markdown files for broken links. Validate URLs, find redirects, and generate reports.',
    category: 'Developer',
    component: lazy(() => import('../tools/markdown-link-checker').then(m => ({ default: m.default }))),
    icon: '🔗',
    shortcut: 'L'
  },
  'table-to-markdown': {
    name: 'table-to-markdown',
    displayName: 'Table to Markdown',
    description: 'Convert HTML tables, CSV, or Excel data to clean Markdown tables with alignment.',
    category: 'Data',
    component: lazy(() => import('../tools/table-to-markdown').then(m => ({ default: m.default }))),
    icon: '📋',
    shortcut: 'T'
  },
  'markdown-toc-generator': {
    name: 'markdown-toc-generator',
    displayName: 'Markdown TOC Generator',
    description: 'Auto-generate table of contents from Markdown headings. Configurable depth, style, and anchor links.',
    category: 'Developer',
    component: lazy(() => import('../tools/markdown-toc-generator').then(m => ({ default: m.default }))),
    icon: '📑',
    shortcut: 'O'
  },
  'text-case-converter': {
    name: 'text-case-converter',
    displayName: 'Text Case Converter',
    description: 'Convert text between camelCase, PascalCase, snake_case, kebab-case, UPPER_CASE, lower case, and Title Case.',
    category: 'Utility',
    component: lazy(() => import('../tools/text-case-converter').then(m => ({ default: m.default }))),
    icon: '🔤',
    shortcut: 'C'
  },
  'html-entities': {
    name: 'html-entities',
    displayName: 'HTML Entities Encoder/Decoder',
    description: 'Encode special characters to HTML entities or decode entities back to characters. Supports named and numeric entities.',
    category: 'Developer',
    component: lazy(() => import('../tools/html-entities').then(m => ({ default: m.default }))),
    icon: '🔣',
    shortcut: 'H'
  },
  'url-encoder': {
    name: 'url-encoder',
    displayName: 'URL Encoder/Decoder',
    description: 'Encode or decode URL components. Handle query parameters, paths, and full URLs with RFC 3986 compliance.',
    category: 'Developer',
    component: lazy(() => import('../tools/url-encoder').then(m => ({ default: m.default }))),
    icon: '🔗',
    shortcut: 'U'
  },
  'slug-generator': {
    name: 'slug-generator',
    displayName: 'Slug Generator',
    description: 'Generate URL-friendly slugs from text. Customizable separators, length limits, and Unicode handling.',
    category: 'Utility',
    component: lazy(() => import('../tools/slug-generator').then(m => ({ default: m.default }))),
    icon: '🔗',
    shortcut: 'S'
  },
  'uuid-generator': {
    name: 'uuid-generator',
    displayName: 'UUID Generator',
    description: 'Generate UUIDs (v1, v4, v5, v7) with bulk generation, formatting options, and validation.',
    category: 'Utility',
    component: lazy(() => import('../tools/uuid-generator').then(m => ({ default: m.default }))),
    icon: '🆔',
    shortcut: 'U'
  },
  'hash-generator': {
    name: 'hash-generator',
    displayName: 'Hash Generator',
    description: 'Generate cryptographic hashes (MD5, SHA-1, SHA-256, SHA-512, RIPEMD-160) for text and files.',
    category: 'Utility',
    component: lazy(() => import('../tools/hash-generator').then(m => ({ default: m.default }))),
    icon: '🔐',
    shortcut: 'H'
  },
  'jwt-encoder': {
    name: 'jwt-encoder',
    displayName: 'JWT Encoder',
    description: 'Create signed JSON Web Tokens with custom headers, payloads, and secrets. Supports HS256, RS256, ES256.',
    category: 'Developer',
    component: lazy(() => import('../tools/jwt-encoder').then(m => ({ default: m.default }))),
    icon: '🔑',
    shortcut: 'J'
  },
  'base64-decoder': {
    name: 'base64-decoder',
    displayName: 'Base64 Decoder',
    description: 'Decode Base64 strings back to text or binary. Auto-detects encoding and handles UTF-8 safely.',
    category: 'Utility',
    component: lazy(() => import('../tools/base64-decoder').then(m => ({ default: m.default }))),
    icon: '🔓',
    shortcut: 'B'
  },
  'yaml-formatter': {
    name: 'yaml-formatter',
    displayName: 'YAML Formatter',
    description: 'Format, validate, and prettify YAML with syntax highlighting. Convert between YAML and JSON.',
    category: 'Developer',
    component: lazy(() => import('../tools/yaml-formatter').then(m => ({ default: m.default }))),
    icon: '📄',
    shortcut: 'Y'
  },
  'xml-formatter': {
    name: 'xml-formatter',
    displayName: 'XML Formatter',
    description: 'Format and prettify XML with indentation, syntax highlighting, and validation.',
    category: 'Developer',
    component: lazy(() => import('../tools/xml-formatter').then(m => ({ default: m.default }))),
    icon: '📄',
    shortcut: 'X'
  },
  'css-minifier': {
    name: 'css-minifier',
    displayName: 'CSS Minifier',
    description: 'Minify CSS with configurable options. Remove whitespace, comments, and optimize selectors.',
    category: 'Developer',
    component: lazy(() => import('../tools/css-minifier').then(m => ({ default: m.default }))),
    icon: '📦',
    shortcut: 'C'
  },
  'image-compressor': {
    name: 'image-compressor',
    displayName: 'Image Compressor',
    description: 'Compress images in browser with quality settings. Supports JPEG, PNG, WebP, AVIF with preview.',
    category: 'Utility',
    component: lazy(() => import('../tools/image-compressor').then(m => ({ default: m.default }))),
    icon: '🖼️',
    shortcut: 'I'
  },
  'morse-code-translator': {
    name: 'morse-code-translator',
    displayName: 'Morse Code Translator',
    description: 'Translate text to Morse code and vice versa. Audio playback, WPM control, and download.',
    category: 'Utility',
    component: lazy(() => import('../tools/morse-code-translator').then(m => ({ default: m.default }))),
    icon: '📡',
    shortcut: 'M'
  },
};

// Derived data
const CATEGORIES = ['All', ...new Set(Object.values(TOOL_REGISTRY).map(t => t.category))];
const TOOL_COUNT = Object.keys(TOOL_REGISTRY).length;

// Components
function ToolLoading() {
  return (
    <div className="tool-loading">
      <div className="tool-loading-spinner"></div>
      <p className="tool-loading-text">Loading tool...</p>
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolMeta }) {
  const catConfig = CATEGORY_CONFIG[tool.category] || CATEGORY_CONFIG.Design;
  
  return (
    <Link 
      to={`/tools/${tool.name}`} 
      className="tool-card"
      data-category={tool.category}
    >
      <span className="tool-card-icon" aria-hidden="true">{tool.icon}</span>
      
      <span className="tool-card-category" style={{ color: catConfig.color, background: catConfig.bg }}>
        {tool.category}
      </span>
      
      <h3 className="tool-card-name">{tool.displayName}</h3>
      
      <p className="tool-card-desc">{tool.description}</p>
      
      <div className="tool-card-footer">
        <span className="tool-card-action">
          Open
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
        {tool.shortcut && (
          <kbd className="tool-card-keyboard">{tool.shortcut}</kbd>
        )}
      </div>
    </Link>
  );
}

function ToolGrid({ tools, viewMode }: { tools: ToolMeta[]; viewMode: 'grid' | 'list' }) {
  if (tools.length === 0) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-state-icon">🔍</div>
        <h3 className="empty-state-title">No tools found</h3>
        <p className="empty-state-desc">Try adjusting your search or category filter</p>
      </div>
    );
  }

  const containerClass = viewMode === 'grid' ? 'tools-grid' : 'tools-list';
  
  return (
    <div className={`${containerClass} animate-fade-in`}>
      {tools.map(tool => (
        <ToolCard key={tool.name} tool={tool} />
      ))}
    </div>
  );
}

// Home Page
function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredTools = useMemo(() => 
    Object.values(TOOL_REGISTRY).filter(tool => {
      const matchesSearch = tool.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }), [searchQuery, selectedCategory]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(TOOL_REGISTRY).forEach(tool => {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="app-container">
      {/* Hero */}
      <header className="app-hero">
        <div className="app-hero-content">
          <div className="app-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <h1 className="app-title">ntools</h1>
          <p className="app-subtitle">
            Professional developer tools built daily. Fast, accessible, and beautiful.
          </p>
          <div className="app-stats">
            <div className="app-stat">
              <span className="app-stat-value">{TOOL_COUNT}</span>
              <span className="app-stat-label">Tools</span>
            </div>
            <div className="app-stat">
              <span className="app-stat-value">{CATEGORIES.length - 1}</span>
              <span className="app-stat-label">Categories</span>
            </div>
            <div className="app-stat">
              <span className="app-stat-value">24/day</span>
              <span className="app-stat-label">Auto-built</span>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <nav className="app-toolbar" aria-label="Tool filters">
        <div className="toolbar-inner">
          <div className="toolbar-search">
            <input
              type="search"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="toolbar-search-input"
              aria-label="Search tools"
            />
            <span className="toolbar-search-icon" aria-hidden="true">🔍</span>
          </div>

          <div className="toolbar-filters">
            <div className="toolbar-category">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="toolbar-category-select"
                aria-label="Filter by category"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : `${cat} (${categoryCounts[cat] || 0})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="toolbar-view-toggle" role="group" aria-label="View mode">
              <button
                className={`toolbar-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                className={`toolbar-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
                aria-pressed={viewMode === 'list'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        <div className="tools-section">
          <div className="tools-header">
            <p className="tools-count">
              Showing <strong>{filteredTools.length}</strong> of <strong>{TOOL_COUNT}</strong> tools
            </p>
          </div>
          <ToolGrid tools={filteredTools} viewMode={viewMode} />
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <p className="footer-text">
            Built daily by automated pipeline
          </p>
          <nav className="footer-links" aria-label="Footer links">
            <a href="https://github.com/M-Destiny/ntools" target="_blank" rel="noopener" className="footer-link">
              GitHub
            </a>
            <a href="https://github.com/M-Destiny/ntools/issues" target="_blank" rel="noopener" className="footer-link">
              Report Issue
            </a>
            <a href="https://github.com/M-Destiny/ntools/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener" className="footer-link">
              Contribute
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

// Tool Page Wrapper
function ToolPage() {
  const { name } = useParams<{ name: string }>();
  const tool = TOOL_REGISTRY[name || ''];

  if (!tool) {
    return (
      <div className="tool-not-found animate-fade-in">
        <div className="tool-not-found-icon">🔧</div>
        <h2>Tool not found</h2>
        <p>No tool named "{name}" exists.</p>
        <Link to="/" className="btn btn-primary tool-page-back">
          ← Back to all tools
        </Link>
      </div>
    );
  }

  const Component = tool.component;
  const catConfig = CATEGORY_CONFIG[tool.category] || CATEGORY_CONFIG.Design;
  const catClass = `tool-page-category-${tool.category.toLowerCase()}`;

  return (
    <div className="tool-page">
      <header className="tool-page-header">
        <Link to="/" className="tool-page-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          All Tools
        </Link>
        <div className="tool-page-title-block">
          <div className="tool-page-title">
            <h1 className="tool-page-name">{tool.displayName}</h1>
            <span className={`tool-page-category ${catClass}`} style={{ color: catConfig.color, background: catConfig.bg }}>
              {tool.category}
            </span>
          </div>
          <p className="tool-page-desc">{tool.description}</p>
        </div>
      </header>
      <main className="tool-page-content">
        <Suspense fallback={<ToolLoading />}>
          <Component />
        </Suspense>
      </main>
    </div>
  );
}

// Main App
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tools/:name" element={<ToolPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;