import { useState, useCallback, useMemo } from 'react';

interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface SitemapConfig {
  baseUrl: string;
  paths: string[];
  defaultChangefreq: SitemapUrl['changefreq'];
  defaultPriority: number;
  includeLastmod: boolean;
  autoLastmod: boolean;
}

export default function SitemapGenerator() {
  const [config, setConfig] = useState<SitemapConfig>({
    baseUrl: 'https://example.com',
    paths: ['/', '/about', '/contact', '/blog', '/products', '/services'],
    defaultChangefreq: 'weekly',
    defaultPriority: 0.8,
    includeLastmod: true,
    autoLastmod: true
  });
  const [sitemapXml, setSitemapXml] = useState('');
  const [urlCount, setUrlCount] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'parser'>('generator');
  const [parseInput, setParseInput] = useState('');
  const [parsedUrls, setParsedUrls] = useState<SitemapUrl[]>([]);

  const changefreqOptions = [
    'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
  ] as const;

  const generateSitemap = useCallback(() => {
    setError('');
    setSitemapXml('');

    try {
      const { baseUrl, paths, defaultChangefreq, defaultPriority, includeLastmod, autoLastmod } = config;
      
      // Validate base URL
      let base: URL;
      try {
        base = new URL(baseUrl);
      } catch {
        setError('Invalid base URL. Must be a valid URL (e.g., https://example.com)');
        return;
      }

      // Normalize base URL (remove trailing slash except for protocol)
      const normalizedBase = base.href.replace(/\/$/, '');

      const urls: SitemapUrl[] = paths
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map((path, index) => {
          // Ensure path starts with /
          const normalizedPath = path.startsWith('/') ? path : `/${path}`;
          const fullUrl = `${normalizedBase}${normalizedPath}`;
          
          let lastmod: string | undefined;
          if (includeLastmod) {
            if (autoLastmod) {
              // Use current date for all, or could vary by path
              lastmod = new Date().toISOString().split('T')[0];
            }
          }

          return {
            url: fullUrl,
            lastmod,
            changefreq: defaultChangefreq,
            priority: index === 0 ? 1.0 : defaultPriority // Homepage gets priority 1.0
          };
        });

      setUrlCount(urls.length);

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
      xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

      urls.forEach(({ url, lastmod, changefreq, priority }) => {
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(url)}</loc>\n`;
        if (lastmod) {
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
        }
        if (changefreq) {
          xml += `    <changefreq>${changefreq}</changefreq>\n`;
        }
        if (priority !== undefined) {
          xml += `    <priority>${priority.toFixed(1)}</priority>\n`;
        }
        xml += '  </url>\n';
      });

      xml += '</urlset>';
      setSitemapXml(xml);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    }
  }, [config]);

  const parseSitemap = useCallback(() => {
    setParsedUrls([]);
    setError('');

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(parseInput, 'application/xml');
      
      const parserErrors = doc.querySelectorAll('parsererror');
      if (parserErrors.length > 0) {
        setError('Invalid XML: ' + parserErrors[0].textContent);
        return;
      }

      const urlElements = doc.querySelectorAll('url');
      const urls: SitemapUrl[] = [];

      urlElements.forEach((urlEl) => {
        const loc = urlEl.querySelector('loc')?.textContent?.trim();
        const lastmod = urlEl.querySelector('lastmod')?.textContent?.trim();
        const changefreq = urlEl.querySelector('changefreq')?.textContent?.trim() as SitemapUrl['changefreq'];
        const priority = urlEl.querySelector('priority')?.textContent?.trim();

        if (loc) {
          urls.push({
            url: loc,
            lastmod: lastmod || undefined,
            changefreq: changefreqOptions.includes(changefreq as any) ? changefreq : undefined,
            priority: priority ? parseFloat(priority) : undefined
          });
        }
      });

      setParsedUrls(urls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parsing failed');
    }
  }, [parseInput]);

  const addPath = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      paths: [...prev.paths, '']
    }));
  }, []);

  const removePath = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      paths: prev.paths.filter((_, i) => i !== index)
    }));
  }, []);

  const updatePath = useCallback((index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      paths: prev.paths.map((p, i) => i === index ? value : p)
    }));
  }, []);

  const updateConfig = useCallback(<K extends keyof SitemapConfig>(key: K, value: SitemapConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const copyToClipboard = useCallback(() => {
    if (sitemapXml) {
      navigator.clipboard.writeText(sitemapXml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [sitemapXml]);

  const downloadSitemap = useCallback(() => {
    if (sitemapXml) {
      const blob = new Blob([sitemapXml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [sitemapXml]);

  const clearAll = useCallback(() => {
    setConfig({
      baseUrl: 'https://example.com',
      paths: ['/', '/about', '/contact', '/blog', '/products', '/services'],
      defaultChangefreq: 'weekly',
      defaultPriority: 0.8,
      includeLastmod: true,
      autoLastmod: true
    });
    setSitemapXml('');
    setUrlCount(0);
    setError('');
  }, []);

  const loadFromRobots = useCallback(() => {
    // Simulated robots.txt parsing - in real usage would fetch
    const sampleRobots = `User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml

Disallow: /admin/
Disallow: /private/`;
    
    // Extract sitemap URLs from robots.txt
    const sitemapMatches = sampleRobots.match(/Sitemap:\s*(.+)/gi);
    if (sitemapMatches) {
      // For demo, we'll just show the sample
      setParseInput(sampleRobots);
      setActiveTab('parser');
    }
  }, []);

  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&apos;');
  };

  // Auto-generate on config change
  const debouncedGenerate = useMemo(() => {
    let timeout: ReturnType<typeof setTimeout>;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(generateSitemap, 300);
    };
  }, [generateSitemap]);

  // Trigger generation when config changes
  useMemo(() => {
    debouncedGenerate();
  }, [config, debouncedGenerate]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Sitemap Generator</h2>
        <p className="tool-desc">
          Generate XML sitemaps for search engines. Define URLs, set priorities, change frequencies, and lastmod dates. Parse existing sitemaps.
        </p>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'generator' ? 'active' : ''}
          onClick={() => setActiveTab('generator')}
        >
          Generate Sitemap
        </button>
        <button
          className={activeTab === 'parser' ? 'active' : ''}
          onClick={() => setActiveTab('parser')}
        >
          Parse Sitemap
        </button>
      </div>

      {activeTab === 'generator' && (
        <>
          <div className="tool-grid">
            <div className="panel">
              <h3>Site Configuration</h3>
              
              <div className="input-group">
                <label>Base URL</label>
                <input
                  type="url"
                  value={config.baseUrl}
                  onChange={e => updateConfig('baseUrl', e.target.value)}
                  placeholder="https://example.com"
                  className="url-input"
                />
                <span className="input-hint">Your website's base URL (required)</span>
              </div>

              <div className="input-row">
                <div className="input-group flex-1">
                  <label>Default Change Frequency</label>
                  <select
                    value={config.defaultChangefreq}
                    onChange={e => updateConfig('defaultChangefreq', e.target.value as SitemapUrl['changefreq'])}
                    className="select-input"
                  >
                    {changefreqOptions.map(opt => (
                      <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group flex-1">
                  <label>Default Priority (0.0 - 1.0)</label>
                  <input
                    type="number"
                    value={config.defaultPriority}
                    onChange={e => updateConfig('defaultPriority', parseFloat(e.target.value))}
                    min="0"
                    max="1"
                    step="0.1"
                    className="number-input"
                  />
                </div>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.includeLastmod}
                    onChange={e => updateConfig('includeLastmod', e.target.checked)}
                  />
                  <span>{'Include <lastmod> dates'}</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.autoLastmod}
                    onChange={e => updateConfig('autoLastmod', e.target.checked)}
                    disabled={!config.includeLastmod}
                  />
                  <span>Auto-generate lastmod (today's date)</span>
                </label>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>URL Paths</h3>
                <button className="add-btn" onClick={addPath}>+ Add Path</button>
              </div>
              
              <div className="paths-list">
                {config.paths.map((path, index) => (
                  <div key={index} className="path-row">
                    <input
                      type="text"
                      value={path}
                      onChange={e => updatePath(index, e.target.value)}
                      placeholder={index === 0 ? '/' : '/path'}
                      className="path-input"
                    />
                    <button
                      className="remove-btn"
                      onClick={() => removePath(index)}
                      disabled={config.paths.length <= 1}
                      title="Remove path"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="quick-paths">
                <span className="quick-label">Quick add:</span>
                {['/blog', '/blog/post-1', '/products', '/products/item-1', '/categories', '/tags', '/search', '/sitemap.html'].map(p => (
                  <button
                    key={p}
                    className="quick-btn"
                    onClick={() => updateConfig('paths', [...config.paths, p])}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="action-bar">
            <button className="primary-btn" onClick={generateSitemap} disabled={!config.baseUrl.trim() || config.paths.every(p => !p.trim())}>
              Generate Sitemap
            </button>
            <button className="secondary-btn" onClick={clearAll}>
              Reset Form
            </button>
          </div>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {sitemapXml && (
            <div className="result-panel success">
              <div className="result-header">
                <span className="valid-badge">✓ Generated ({urlCount} URLs)</span>
                <div className="result-actions">
                  <button className="copy-btn" onClick={copyToClipboard}>
                    {copied ? '✓ Copied!' : 'Copy XML'}
                  </button>
                  <button className="download-btn" onClick={downloadSitemap}>
                    Download .xml
                  </button>
                </div>
              </div>
              <pre className="xml-preview"><code>{sitemapXml}</code></pre>
            </div>
          )}
        </>
      )}

      {activeTab === 'parser' && (
        <div className="tool-grid">
          <div className="panel">
            <h3>Parse Existing Sitemap</h3>
            
            <div className="input-group">
              <label>Sitemap XML Input</label>
              <textarea
                value={parseInput}
                onChange={e => setParseInput(e.target.value)}
                placeholder="Paste sitemap.xml content here..."
                className="code-editor"
                spellCheck={false}
              />
            </div>

            <div className="parser-actions">
              <button className="primary-btn" onClick={parseSitemap} disabled={!parseInput.trim()}>
                Parse Sitemap
              </button>
              <button className="secondary-btn" onClick={() => { setParseInput(''); setParsedUrls([]); }}>
                Clear
              </button>
              <button className="secondary-btn" onClick={loadFromRobots}>
                Load Sample robots.txt
              </button>
            </div>

            {error && activeTab === 'parser' && (
              <div className="error-banner">{error}</div>
            )}
          </div>

          <div className="panel">
            <h3>Parsed URLs ({parsedUrls.length})</h3>
            
            {parsedUrls.length > 0 && (
              <div className="parsed-table-container">
                <table className="parsed-table">
                  <thead>
                    <tr>
                      <th>URL</th>
                      <th>Lastmod</th>
                      <th>Changefreq</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedUrls.map((url, index) => (
                      <tr key={index}>
                        <td className="url-cell"><code>{url.url}</code></td>
                        <td>{url.lastmod || '-'}</td>
                        <td>{url.changefreq || '-'}</td>
                        <td>{url.priority !== undefined ? url.priority.toFixed(1) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {parsedUrls.length === 0 && parseInput && !error && (
              <div className="empty-state">
                <p>No URLs found in sitemap. Ensure it follows the sitemaps.org schema.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}