import { useState, useMemo, useCallback } from 'react';

interface MetaTags {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  ogSiteName: string;
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  robots: string;
  viewport: string;
  charset: string;
  themeColor: string;
  author: string;
  keywords: string;
  language: string;
  rating: string;
  generator: string;
  referrer: string;
}

const DEFAULT_TAGS: MetaTags = {
  title: '',
  description: '',
  canonicalUrl: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  ogUrl: '',
  ogType: 'website',
  ogSiteName: '',
  twitterCard: 'summary_large_image',
  twitterSite: '',
  twitterCreator: '',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  charset: 'UTF-8',
  themeColor: '#3b82f6',
  author: '',
  keywords: '',
  language: 'en',
  rating: '',
  generator: '',
  referrer: 'strict-origin-when-cross-origin',
};

const OG_TYPES = [
  'website', 'article', 'book', 'profile',
  'music.song', 'music.album', 'music.playlist', 'music.radio_station',
  'video.movie', 'video.episode', 'video.tv_show', 'video.other',
  'product', 'product.item', 'product.group',
];

const TWITTER_CARDS = [
  'summary', 'summary_large_image', 'app', 'player',
];

const ROBOTS_OPTIONS = [
  'index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow',
  'none', 'noarchive', 'nosnippet', 'noimageindex',
];

const RATING_OPTIONS = [
  '', 'general', 'mature', 'restricted', '14 years', 'safe for kids',
];

const REFERRER_OPTIONS = [
  'strict-origin-when-cross-origin', 'no-referrer', 'no-referrer-when-downgrade',
  'origin', 'origin-when-cross-origin', 'same-origin', 'strict-origin', 'unsafe-url',
];

export default function MetaTagGenerator() {
  const [tags, setTags] = useState<MetaTags>(DEFAULT_TAGS);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'open-graph' | 'twitter' | 'advanced'>('basic');
  const [previewMode, setPreviewMode] = useState<'html' | 'json' | 'react'>('html');

  const updateTag = useCallback(<K extends keyof MetaTags>(key: K, value: MetaTags[K]) => {
    setTags(prev => ({ ...prev, [key]: value }));
  }, []);

  const generateHtml = useCallback(() => {
    const lines: string[] = [];
    
    // Charset
    if (tags.charset) {
      lines.push(`<meta charset="${tags.charset}">`);
    }
    
    // Viewport
    if (tags.viewport) {
      lines.push(`<meta name="viewport" content="${tags.viewport}">`);
    }
    
    // Title
    if (tags.title) {
      lines.push(`<title>${escapeHtml(tags.title)}</title>`);
    }
    
    // Basic meta
    if (tags.description) {
      lines.push(`<meta name="description" content="${escapeHtml(tags.description)}">`);
    }
    if (tags.author) {
      lines.push(`<meta name="author" content="${escapeHtml(tags.author)}">`);
    }
    if (tags.keywords) {
      lines.push(`<meta name="keywords" content="${escapeHtml(tags.keywords)}">`);
    }
    if (tags.robots) {
      lines.push(`<meta name="robots" content="${tags.robots}">`);
    }
    if (tags.language) {
      lines.push(`<meta name="language" content="${tags.language}">`);
    }
    if (tags.rating) {
      lines.push(`<meta name="rating" content="${tags.rating}">`);
    }
    if (tags.generator) {
      lines.push(`<meta name="generator" content="${escapeHtml(tags.generator)}">`);
    }
    if (tags.referrer) {
      lines.push(`<meta name="referrer" content="${tags.referrer}">`);
    }
    
    // Canonical
    if (tags.canonicalUrl) {
      lines.push(`<link rel="canonical" href="${escapeHtml(tags.canonicalUrl)}">`);
    }
    
    // Theme color
    if (tags.themeColor) {
      lines.push(`<meta name="theme-color" content="${tags.themeColor}">`);
    }
    
    // Open Graph
    if (tags.ogTitle || tags.title) {
      lines.push(`<meta property="og:title" content="${escapeHtml(tags.ogTitle || tags.title)}">`);
    }
    if (tags.ogDescription || tags.description) {
      lines.push(`<meta property="og:description" content="${escapeHtml(tags.ogDescription || tags.description)}">`);
    }
    if (tags.ogImage) {
      lines.push(`<meta property="og:image" content="${escapeHtml(tags.ogImage)}">`);
    }
    if (tags.ogUrl || tags.canonicalUrl) {
      lines.push(`<meta property="og:url" content="${escapeHtml(tags.ogUrl || tags.canonicalUrl)}">`);
    }
    if (tags.ogType) {
      lines.push(`<meta property="og:type" content="${tags.ogType}">`);
    }
    if (tags.ogSiteName) {
      lines.push(`<meta property="og:site_name" content="${escapeHtml(tags.ogSiteName)}">`);
    }
    
    // Twitter
    if (tags.twitterCard) {
      lines.push(`<meta name="twitter:card" content="${tags.twitterCard}">`);
    }
    if (tags.twitterSite) {
      lines.push(`<meta name="twitter:site" content="${escapeHtml(tags.twitterSite)}">`);
    }
    if (tags.twitterCreator) {
      lines.push(`<meta name="twitter:creator" content="${escapeHtml(tags.twitterCreator)}">`);
    }
    if (tags.twitterTitle || tags.ogTitle || tags.title) {
      lines.push(`<meta name="twitter:title" content="${escapeHtml(tags.twitterTitle || tags.ogTitle || tags.title)}">`);
    }
    if (tags.twitterDescription || tags.ogDescription || tags.description) {
      lines.push(`<meta name="twitter:description" content="${escapeHtml(tags.twitterDescription || tags.ogDescription || tags.description)}">`);
    }
    if (tags.twitterImage || tags.ogImage) {
      lines.push(`<meta name="twitter:image" content="${escapeHtml(tags.twitterImage || tags.ogImage)}">`);
    }
    
    return lines.join('\n');
  }, [tags]);

  const generateJson = useCallback(() => {
    const json: Record<string, string> = {};
    
    if (tags.charset) json['charset'] = tags.charset;
    if (tags.viewport) json['viewport'] = tags.viewport;
    if (tags.title) json['title'] = tags.title;
    if (tags.description) json['description'] = tags.description;
    if (tags.author) json['author'] = tags.author;
    if (tags.keywords) json['keywords'] = tags.keywords;
    if (tags.robots) json['robots'] = tags.robots;
    if (tags.language) json['language'] = tags.language;
    if (tags.rating) json['rating'] = tags.rating;
    if (tags.generator) json['generator'] = tags.generator;
    if (tags.referrer) json['referrer'] = tags.referrer;
    if (tags.canonicalUrl) json['canonical'] = tags.canonicalUrl;
    if (tags.themeColor) json['theme-color'] = tags.themeColor;
    
    if (tags.ogTitle) json['og:title'] = tags.ogTitle;
    if (tags.ogDescription) json['og:description'] = tags.ogDescription;
    if (tags.ogImage) json['og:image'] = tags.ogImage;
    if (tags.ogUrl) json['og:url'] = tags.ogUrl;
    if (tags.ogType) json['og:type'] = tags.ogType;
    if (tags.ogSiteName) json['og:site_name'] = tags.ogSiteName;
    
    if (tags.twitterCard) json['twitter:card'] = tags.twitterCard;
    if (tags.twitterSite) json['twitter:site'] = tags.twitterSite;
    if (tags.twitterCreator) json['twitter:creator'] = tags.twitterCreator;
    if (tags.twitterTitle) json['twitter:title'] = tags.twitterTitle;
    if (tags.twitterDescription) json['twitter:description'] = tags.twitterDescription;
    if (tags.twitterImage) json['twitter:image'] = tags.twitterImage;
    
    return JSON.stringify(json, null, 2);
  }, [tags]);

  const generateReact = useCallback(() => {
    const lines: string[] = [
      'import { Helmet } from "react-helmet-async";',
      '',
      'export function MetaTags() {',
      '  return (',
      '    <Helmet>',
    ];
    
    if (tags.charset) lines.push(`      <meta charSet="${tags.charset}" />`);
    if (tags.title) lines.push(`      <title>${escapeHtml(tags.title)}</title>`);
    if (tags.description) lines.push(`      <meta name="description" content="${escapeHtml(tags.description)}" />`);
    if (tags.author) lines.push(`      <meta name="author" content="${escapeHtml(tags.author)}" />`);
    if (tags.keywords) lines.push(`      <meta name="keywords" content="${escapeHtml(tags.keywords)}" />`);
    if (tags.robots) lines.push(`      <meta name="robots" content="${tags.robots}" />`);
    if (tags.language) lines.push(`      <meta name="language" content="${tags.language}" />`);
    if (tags.rating) lines.push(`      <meta name="rating" content="${tags.rating}" />`);
    if (tags.generator) lines.push(`      <meta name="generator" content="${escapeHtml(tags.generator)}" />`);
    if (tags.referrer) lines.push(`      <meta name="referrer" content="${tags.referrer}" />`);
    if (tags.canonicalUrl) lines.push(`      <link rel="canonical" href="${escapeHtml(tags.canonicalUrl)}" />`);
    if (tags.viewport) lines.push(`      <meta name="viewport" content="${tags.viewport}" />`);
    if (tags.themeColor) lines.push(`      <meta name="theme-color" content="${tags.themeColor}" />`);
    
    if (tags.ogTitle || tags.title) lines.push(`      <meta property="og:title" content="${escapeHtml(tags.ogTitle || tags.title)}" />`);
    if (tags.ogDescription || tags.description) lines.push(`      <meta property="og:description" content="${escapeHtml(tags.ogDescription || tags.description)}" />`);
    if (tags.ogImage) lines.push(`      <meta property="og:image" content="${escapeHtml(tags.ogImage)}" />`);
    if (tags.ogUrl || tags.canonicalUrl) lines.push(`      <meta property="og:url" content="${escapeHtml(tags.ogUrl || tags.canonicalUrl)}" />`);
    if (tags.ogType) lines.push(`      <meta property="og:type" content="${tags.ogType}" />`);
    if (tags.ogSiteName) lines.push(`      <meta property="og:site_name" content="${escapeHtml(tags.ogSiteName)}" />`);
    
    if (tags.twitterCard) lines.push(`      <meta name="twitter:card" content="${tags.twitterCard}" />`);
    if (tags.twitterSite) lines.push(`      <meta name="twitter:site" content="${escapeHtml(tags.twitterSite)}" />`);
    if (tags.twitterCreator) lines.push(`      <meta name="twitter:creator" content="${escapeHtml(tags.twitterCreator)}" />`);
    if (tags.twitterTitle || tags.ogTitle || tags.title) lines.push(`      <meta name="twitter:title" content="${escapeHtml(tags.twitterTitle || tags.ogTitle || tags.title)}" />`);
    if (tags.twitterDescription || tags.ogDescription || tags.description) lines.push(`      <meta name="twitter:description" content="${escapeHtml(tags.twitterDescription || tags.ogDescription || tags.description)}" />`);
    if (tags.twitterImage || tags.ogImage) lines.push(`      <meta name="twitter:image" content="${escapeHtml(tags.twitterImage || tags.ogImage)}" />`);
    
    lines.push('    </Helmet>');
    lines.push('  );');
    lines.push('}');
    
    return lines.join('\n');
  }, [tags]);

  const copyToClipboard = useCallback(() => {
    let content = '';
    if (previewMode === 'html') content = generateHtml();
    else if (previewMode === 'json') content = generateJson();
    else content = generateReact();
    
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [previewMode, generateHtml, generateJson, generateReact]);

  const loadPreset = useCallback((preset: string) => {
    const presets: Record<string, Partial<MetaTags>> = {
      blog: {
        title: 'My Awesome Blog Post',
        description: 'Learn how to build amazing things with modern web technologies.',
        canonicalUrl: 'https://example.com/blog/awesome-post',
        ogTitle: 'My Awesome Blog Post',
        ogDescription: 'Learn how to build amazing things with modern web technologies.',
        ogImage: 'https://example.com/images/blog-cover.jpg',
        ogUrl: 'https://example.com/blog/awesome-post',
        ogType: 'article',
        ogSiteName: 'My Blog',
        twitterCard: 'summary_large_image',
        twitterSite: '@myblog',
        twitterCreator: '@author',
        author: 'John Doe',
        keywords: 'web development, tutorial, react, javascript',
        themeColor: '#3b82f6',
      },
      product: {
        title: 'Amazing Product - Buy Now',
        description: 'The best product you\'ll ever need. Features include X, Y, and Z.',
        canonicalUrl: 'https://shop.example.com/products/amazing-product',
        ogTitle: 'Amazing Product',
        ogDescription: 'The best product you\'ll ever need.',
        ogImage: 'https://shop.example.com/images/product-main.jpg',
        ogUrl: 'https://shop.example.com/products/amazing-product',
        ogType: 'product',
        ogSiteName: 'Example Shop',
        twitterCard: 'summary_large_image',
        twitterSite: '@exampleshop',
        twitterCreator: '@exampleshop',
        author: 'Example Shop',
        keywords: 'product, buy, shop, ecommerce',
        themeColor: '#10b981',
      },
      minimal: {
        title: 'Page Title',
        description: 'Page description for SEO.',
        canonicalUrl: 'https://example.com/page',
        viewport: 'width=device-width, initial-scale=1',
        charset: 'UTF-8',
        robots: 'index, follow',
      },
    };
    
    if (presets[preset]) {
      setTags(prev => ({ ...prev, ...presets[preset] }));
    }
  }, []);

  const clearAll = useCallback(() => {
    setTags(DEFAULT_TAGS);
  }, []);

  const outputHtml = generateHtml();
  const outputJson = generateJson();
  const outputReact = generateReact();
  const currentOutput = previewMode === 'html' ? outputHtml : previewMode === 'json' ? outputJson : outputReact;

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Meta Tag Generator</h2>
        <p className="tool-desc">Generate HTML meta tags for SEO, Open Graph, Twitter Cards, and more. Export as HTML, JSON, or React Helmet code.</p>
      </div>

      <div className="meta-layout">
        <div className="input-panel">
          <div className="tab-bar">
            <button className={activeTab === 'basic' ? 'active' : ''} onClick={() => setActiveTab('basic')}>Basic SEO</button>
            <button className={activeTab === 'open-graph' ? 'active' : ''} onClick={() => setActiveTab('open-graph')}>Open Graph</button>
            <button className={activeTab === 'twitter' ? 'active' : ''} onClick={() => setActiveTab('twitter')}>Twitter Cards</button>
            <button className={activeTab === 'advanced' ? 'active' : ''} onClick={() => setActiveTab('advanced')}>Advanced</button>
          </div>

          <div className="tab-content">
            {activeTab === 'basic' && (
              <div className="fields-grid">
                <div className="field-group">
                  <label htmlFor="title">Page Title *</label>
                  <input
                    id="title"
                    type="text"
                    value={tags.title}
                    onChange={e => updateTag('title', e.target.value)}
                    placeholder="My Page Title"
                    maxLength={60}
                  />
                  <span className="field-hint">50-60 chars recommended for Google</span>
                </div>
                <div className="field-group">
                  <label htmlFor="description">Meta Description *</label>
                  <textarea
                    id="description"
                    value={tags.description}
                    onChange={e => updateTag('description', e.target.value)}
                    placeholder="Page description for search results..."
                    maxLength={160}
                    rows={3}
                  />
                  <span className="field-hint">150-160 chars recommended</span>
                </div>
                <div className="field-group">
                  <label htmlFor="canonicalUrl">Canonical URL</label>
                  <input
                    id="canonicalUrl"
                    type="url"
                    value={tags.canonicalUrl}
                    onChange={e => updateTag('canonicalUrl', e.target.value)}
                    placeholder="https://example.com/page"
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="author">Author</label>
                  <input
                    id="author"
                    type="text"
                    value={tags.author}
                    onChange={e => updateTag('author', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="keywords">Keywords (comma-separated)</label>
                  <input
                    id="keywords"
                    type="text"
                    value={tags.keywords}
                    onChange={e => updateTag('keywords', e.target.value)}
                    placeholder="web development, tutorial, react"
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="robots">Robots</label>
                  <select
                    id="robots"
                    value={tags.robots}
                    onChange={e => updateTag('robots', e.target.value)}
                    className="field-select"
                  >
                    {ROBOTS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label htmlFor="language">Language</label>
                  <input
                    id="language"
                    type="text"
                    value={tags.language}
                    onChange={e => updateTag('language', e.target.value)}
                    placeholder="en"
                    maxLength={5}
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="rating">Rating</label>
                  <select
                    id="rating"
                    value={tags.rating}
                    onChange={e => updateTag('rating', e.target.value)}
                    className="field-select"
                  >
                    {RATING_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || '(none)'}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label htmlFor="generator">Generator</label>
                  <input
                    id="generator"
                    type="text"
                    value={tags.generator}
                    onChange={e => updateTag('generator', e.target.value)}
                    placeholder="My CMS 1.0"
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="referrer">Referrer Policy</label>
                  <select
                    id="referrer"
                    value={tags.referrer}
                    onChange={e => updateTag('referrer', e.target.value)}
                    className="field-select"
                  >
                    {REFERRER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'open-graph' && (
              <div className="fields-grid">
                <div className="field-group">
                  <label htmlFor="ogTitle">og:title *</label>
                  <input
                    id="ogTitle"
                    type="text"
                    value={tags.ogTitle}
                    onChange={e => updateTag('ogTitle', e.target.value)}
                    placeholder="Content Title"
                    maxLength={60}
                  />
                  <span className="field-hint">Falls back to page title</span>
                </div>
                <div className="field-group">
                  <label htmlFor="ogDescription">og:description *</label>
                  <textarea
                    id="ogDescription"
                    value={tags.ogDescription}
                    onChange={e => updateTag('ogDescription', e.target.value)}
                    placeholder="Content description for social sharing..."
                    maxLength={200}
                    rows={3}
                  />
                  <span className="field-hint">Falls back to meta description</span>
                </div>
                <div className="field-group">
                  <label htmlFor="ogImage">og:image *</label>
                  <input
                    id="ogImage"
                    type="url"
                    value={tags.ogImage}
                    onChange={e => updateTag('ogImage', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <span className="field-hint">1200x630px recommended (1.91:1 ratio)</span>
                </div>
                <div className="field-group">
                  <label htmlFor="ogUrl">og:url</label>
                  <input
                    id="ogUrl"
                    type="url"
                    value={tags.ogUrl}
                    onChange={e => updateTag('ogUrl', e.target.value)}
                    placeholder="https://example.com/page"
                  />
                  <span className="field-hint">Falls back to canonical URL</span>
                </div>
                <div className="field-group">
                  <label htmlFor="ogType">og:type</label>
                  <select
                    id="ogType"
                    value={tags.ogType}
                    onChange={e => updateTag('ogType', e.target.value)}
                    className="field-select"
                  >
                    {OG_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label htmlFor="ogSiteName">og:site_name</label>
                  <input
                    id="ogSiteName"
                    type="text"
                    value={tags.ogSiteName}
                    onChange={e => updateTag('ogSiteName', e.target.value)}
                    placeholder="My Website"
                  />
                </div>
              </div>
            )}

            {activeTab === 'twitter' && (
              <div className="fields-grid">
                <div className="field-group">
                  <label htmlFor="twitterCard">twitter:card *</label>
                  <select
                    id="twitterCard"
                    value={tags.twitterCard}
                    onChange={e => updateTag('twitterCard', e.target.value)}
                    className="field-select"
                  >
                    {TWITTER_CARDS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label htmlFor="twitterSite">twitter:site</label>
                  <input
                    id="twitterSite"
                    type="text"
                    value={tags.twitterSite}
                    onChange={e => updateTag('twitterSite', e.target.value)}
                    placeholder="@username"
                  />
                  <span className="field-hint">Website's Twitter handle</span>
                </div>
                <div className="field-group">
                  <label htmlFor="twitterCreator">twitter:creator</label>
                  <input
                    id="twitterCreator"
                    type="text"
                    value={tags.twitterCreator}
                    onChange={e => updateTag('twitterCreator', e.target.value)}
                    placeholder="@author"
                  />
                  <span className="field-hint">Content author's Twitter handle</span>
                </div>
                <div className="field-group">
                  <label htmlFor="twitterTitle">twitter:title</label>
                  <input
                    id="twitterTitle"
                    type="text"
                    value={tags.twitterTitle}
                    onChange={e => updateTag('twitterTitle', e.target.value)}
                    placeholder="Content Title"
                    maxLength={70}
                  />
                  <span className="field-hint">Falls back to og:title</span>
                </div>
                <div className="field-group">
                  <label htmlFor="twitterDescription">twitter:description</label>
                  <textarea
                    id="twitterDescription"
                    value={tags.twitterDescription}
                    onChange={e => updateTag('twitterDescription', e.target.value)}
                    placeholder="Content description..."
                    maxLength={200}
                    rows={3}
                  />
                  <span className="field-hint">Falls back to og:description</span>
                </div>
                <div className="field-group">
                  <label htmlFor="twitterImage">twitter:image</label>
                  <input
                    id="twitterImage"
                    type="url"
                    value={tags.twitterImage}
                    onChange={e => updateTag('twitterImage', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <span className="field-hint">Falls back to og:image</span>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="fields-grid">
                <div className="field-group">
                  <label htmlFor="charset">Charset</label>
                  <input
                    id="charset"
                    type="text"
                    value={tags.charset}
                    onChange={e => updateTag('charset', e.target.value)}
                    placeholder="UTF-8"
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="viewport">Viewport</label>
                  <input
                    id="viewport"
                    type="text"
                    value={tags.viewport}
                    onChange={e => updateTag('viewport', e.target.value)}
                    placeholder="width=device-width, initial-scale=1"
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="themeColor">Theme Color</label>
                  <input
                    id="themeColor"
                    type="color"
                    value={tags.themeColor}
                    onChange={e => updateTag('themeColor', e.target.value)}
                  />
                  <span className="field-hint">Browser UI color (mobile Chrome, etc.)</span>
                </div>
              </div>
            )}
          </div>

          <div className="preset-bar">
            <span>Presets:</span>
            <button onClick={() => loadPreset('blog')}>Blog Post</button>
            <button onClick={() => loadPreset('product')}>Product Page</button>
            <button onClick={() => loadPreset('minimal')}>Minimal</button>
            <button className="btn-secondary" onClick={clearAll}>Clear All</button>
          </div>

          <div className="action-buttons">
            <button 
              className={copied ? 'btn-primary copied' : 'btn-primary'} 
              onClick={copyToClipboard}
              disabled={!currentOutput.trim()}
            >
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>

        <div className="output-panel">
          <div className="output-toolbar">
            <h3>Generated Output</h3>
            <div className="preview-tabs">
              <button className={previewMode === 'html' ? 'active' : ''} onClick={() => setPreviewMode('html')}>HTML</button>
              <button className={previewMode === 'json' ? 'active' : ''} onClick={() => setPreviewMode('json')}>JSON</button>
              <button className={previewMode === 'react' ? 'active' : ''} onClick={() => setPreviewMode('react')}>React Helmet</button>
            </div>
          </div>
          
          <div className="meta-output">
            <pre className={previewMode === 'html' ? 'html-output' : previewMode === 'json' ? 'json-output' : 'react-output'}>
              {currentOutput || '<span class="placeholder">Fill in the fields to generate meta tags</span>'}
            </pre>
          </div>

          <div className="validation-panel">
            <h4>Validation Checklist</h4>
            <ul>
              <li className={tags.title && tags.title.length >= 30 && tags.title.length <= 60 ? 'pass' : 'fail'}>
                {tags.title ? '✓' : '✗'} Title: {tags.title.length} chars (optimal: 30-60)
              </li>
              <li className={tags.description && tags.description.length >= 120 && tags.description.length <= 160 ? 'pass' : 'fail'}>
                {tags.description ? '✓' : '✗'} Description: {tags.description.length} chars (optimal: 120-160)
              </li>
              <li className={tags.ogTitle ? 'pass' : 'fail'}>
                {tags.ogTitle ? '✓' : '✗'} Open Graph title present
              </li>
              <li className={tags.ogDescription ? 'pass' : 'fail'}>
                {tags.ogDescription ? '✓' : '✗'} Open Graph description present
              </li>
              <li className={tags.ogImage ? 'pass' : 'fail'}>
                {tags.ogImage ? '✓' : '✗'} Open Graph image present
              </li>
              <li className={tags.twitterCard ? 'pass' : 'fail'}>
                {tags.twitterCard ? '✓' : '✗'} Twitter card type set
              </li>
              <li className={tags.canonicalUrl ? 'pass' : 'fail'}>
                {tags.canonicalUrl ? '✓' : '✗'} Canonical URL set
              </li>
              <li className={tags.viewport ? 'pass' : 'fail'}>
                {tags.viewport ? '✓' : '✗'} Viewport meta tag set
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="help-section">
        <details>
          <summary>Meta Tags Guide</summary>
          <div className="help-content">
            <h4>Essential Tags</h4>
            <ul>
              <li><strong>Title</strong> — Most important for SEO. 50-60 chars.</li>
              <li><strong>Description</strong> — Shown in search results. 150-160 chars.</li>
              <li><strong>Canonical URL</strong> — Prevents duplicate content issues.</li>
              <li><strong>Viewport</strong> — Required for mobile responsiveness.</li>
            </ul>

            <h4>Open Graph (Facebook, LinkedIn, Discord, Slack)</h4>
            <ul>
              <li><strong>og:title, og:description, og:image</strong> — Required for rich previews</li>
              <li><strong>og:type</strong> — 'website' (default), 'article', 'product', etc.</li>
              <li><strong>og:url</strong> — Canonical URL for the object</li>
              <li><strong>og:site_name</strong> — Your site's name</li>
            </ul>

            <h4>Twitter Cards</h4>
            <ul>
              <li><strong>summary_large_image</strong> — Large image card (recommended)</li>
              <li><strong>summary</strong> — Small image card</li>
              <li><strong>twitter:site / twitter:creator</strong> — Attribution handles</li>
            </ul>

            <h4>Advanced</h4>
            <ul>
              <li><strong>theme-color</strong> — Browser UI color on mobile</li>
              <li><strong>referrer</strong> — Controls Referer header</li>
              <li><strong>robots</strong> — Crawler directives</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}