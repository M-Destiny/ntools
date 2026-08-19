import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import './App.css';

// Types
interface ToolMeta {
  name: string;
  displayName: string;
  description: string;
  category: string;
  component: React.ComponentType;
}

// Tool registry - dynamically built from /tools directory
const TOOL_REGISTRY: Record<string, ToolMeta> = {
  'color-picker': {
    name: 'color-picker',
    displayName: 'Color Picker',
    description: 'Pick colors from anywhere on screen, get hex/rgb/hsl values, build palettes',
    category: 'Design',
    component: lazy(() => import('../tools/color-picker').then(m => ({ default: m.default })))
  },
  'json-formatter': {
    name: 'json-formatter',
    displayName: 'JSON Formatter',
    description: 'Format, validate, minify, and prettify JSON with syntax highlighting',
    category: 'Developer',
    component: lazy(() => import('../tools/json-formatter').then(m => ({ default: m.default })))
  },
  'markdown-preview': {
    name: 'markdown-preview',
    displayName: 'Markdown Preview',
    description: 'Live markdown editor with real-time HTML preview, syntax highlighting, and export options',
    category: 'Developer',
    component: lazy(() => import('../tools/markdown-preview').then(m => ({ default: m.default })))
  },
  'csv-to-table': {
    name: 'csv-to-table',
    displayName: 'CSV to Table',
    description: 'Parse CSV data into a sortable, filterable table with pagination. Export as Markdown, JSON, or CSV.',
    category: 'Data',
    component: lazy(() => import('../tools/csv-to-table').then(m => ({ default: m.default })))
  },
  'regex-tester': {
    name: 'regex-tester',
    displayName: 'Regex Tester',
    description: 'Test and debug regular expressions with live matching, syntax explanation, and examples.',
    category: 'Developer',
    component: lazy(() => import('../tools/regex-tester').then(m => ({ default: m.default })))
  },
  'gradient-generator': {
    name: 'gradient-generator',
    displayName: 'Gradient Generator',
    description: 'Create beautiful CSS gradients — linear, radial, and conic. Export ready-to-use CSS code.',
    category: 'Design',
    component: lazy(() => import('../tools/gradient-generator').then(m => ({ default: m.default })))
  },
  'unit-converter': {
    name: 'unit-converter',
    displayName: 'Unit Converter',
    description: 'Convert between units across 10 categories — length, weight, temperature, volume, area, speed, time, data, pressure, energy.',
    category: 'Utility',
    component: lazy(() => import('../tools/unit-converter').then(m => ({ default: m.default })))
  },
  'qr-code-generator': {
    name: 'qr-code-generator',
    displayName: 'QR Code Generator',
    description: 'Generate QR codes for URLs, text, contacts, WiFi, and more. Customize colors, size, error correction, and add a logo.',
    category: 'Utility',
    component: lazy(() => import('../tools/qr-code-generator').then(m => ({ default: m.default })))
  },
  'diff-checker': {
    name: 'diff-checker',
    displayName: 'Diff Checker',
    description: 'Compare two text blocks and visualize differences with side-by-side or unified view. Line-by-line diff with syntax highlighting.',
    category: 'Developer',
    component: lazy(() => import('../tools/diff-checker').then(m => ({ default: m.default })))
  },
  'base64-encoder': {
    name: 'base64-encoder',
    displayName: 'Base64 Encoder/Decoder',
    description: 'Encode text or files to Base64, decode Base64 back to text. Supports UTF-8 and binary files with file upload.',
    category: 'Utility',
    component: lazy(() => import('../tools/base64-encoder').then(m => ({ default: m.default })))
  },
  'cron-builder': {
    name: 'cron-builder',
    displayName: 'Cron Expression Builder',
    description: 'Build and test cron expressions visually with field selectors, presets, human-readable descriptions, and next-run predictions.',
    category: 'Utility',
    component: lazy(() => import('../tools/cron-builder').then(m => ({ default: m.default })))
  },
  'jwt-decoder': {
    name: 'jwt-decoder',
    displayName: 'JWT Decoder',
    description: 'Decode, inspect, and verify JSON Web Tokens with header/payload inspection, signature verification, and timestamp humanization.',
    category: 'Developer',
    component: lazy(() => import('../tools/jwt-decoder').then(m => ({ default: m.default })))
  },
  'unix-timestamp': {
    name: 'unix-timestamp',
    displayName: 'Unix Timestamp Converter',
    description: 'Convert between Unix timestamps (seconds/ms) and human-readable dates. Supports ISO 8601, RFC 2822, and custom formats.',
    category: 'Utility',
    component: lazy(() => import('../tools/unix-timestamp').then(m => ({ default: m.default })))
  },
  'color-contrast': {
    name: 'color-contrast',
    displayName: 'Color Contrast Checker',
    description: 'Check WCAG contrast ratios between foreground and background colors. Test AA and AAA compliance for normal and large text.',
    category: 'Design',
    component: lazy(() => import('../tools/color-contrast').then(m => ({ default: m.default })))
  },
  'password-generator': {
    name: 'password-generator',
    displayName: 'Password Generator',
    description: 'Generate cryptographically secure passwords with customizable options. Uses Web Crypto API for true randomness.',
    category: 'Utility',
    component: lazy(() => import('../tools/password-generator').then(m => ({ default: m.default })))
  },
  'qr-scanner': {
    name: 'qr-scanner',
    displayName: 'QR Code Scanner',
    description: 'Scan QR codes using your camera or upload an image. Real-time scanning with Barcode Detection API.',
    category: 'Utility',
    component: lazy(() => import('../tools/qr-scanner').then(m => ({ default: m.default })))
  }
};

// Categories for filtering
const CATEGORIES = ['All', ...new Set(Object.values(TOOL_REGISTRY).map(t => t.category))];

// Loading fallback
function ToolLoading() {
  return (
    <div className="tool-loading">
      <div className="spinner"></div>
      <p>Loading tool...</p>
    </div>
  );
}

// Home Page - Tool Gallery
function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredTools = Object.values(TOOL_REGISTRY).filter(tool => {
    const matchesSearch = tool.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          <span className="logo-icon">🔧</span>
          ntools
        </h1>
        <p className="app-subtitle">Daily UI Tools Factory — {Object.keys(TOOL_REGISTRY).length} tools and growing</p>
      </header>

      <div className="toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filters">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ⧉
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <div className={`tools-${viewMode}`}>
        {filteredTools.length === 0 ? (
          <div className="empty-state">
            <p>No tools found matching "{searchQuery}" in {selectedCategory}</p>
          </div>
        ) : (
          filteredTools.map(tool => (
            <Link key={tool.name} to={`/tools/${tool.name}`} className="tool-card">
              <div className="tool-card-header">
                <span className="tool-category">{tool.category}</span>
                <h3 className="tool-name">{tool.displayName}</h3>
              </div>
              <p className="tool-description">{tool.description}</p>
              <span className="tool-action">Open →</span>
            </Link>
          ))
        )}
      </div>

      <footer className="app-footer">
        <p>Built daily by automated pipeline • <a href="https://github.com/M-Destiny/ntools" target="_blank" rel="noopener">GitHub</a></p>
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
      <div className="tool-not-found">
        <h2>Tool not found</h2>
        <p>No tool named "{name}" exists.</p>
        <Link to="/" className="back-link">← Back to all tools</Link>
      </div>
    );
  }

  const Component = tool.component;

  return (
    <div className="tool-page">
      <header className="tool-page-header">
        <Link to="/" className="back-link">← All Tools</Link>
        <div className="tool-page-title">
          <h2>{tool.displayName}</h2>
          <span className="tool-category-badge">{tool.category}</span>
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

// Main App with Routing
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