import { useState, useCallback, useMemo } from 'react';

type ChangeType = 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';

const CHANGE_TYPES: { id: ChangeType; label: string; emoji: string; description: string }[] = [
  { id: 'added', label: 'Added', emoji: '✨', description: 'New features' },
  { id: 'changed', label: 'Changed', emoji: '🔄', description: 'Changes in existing functionality' },
  { id: 'deprecated', label: 'Deprecated', emoji: '⚠️', description: 'Soon-to-be removed features' },
  { id: 'removed', label: 'Removed', emoji: '🗑️', description: 'Now removed features' },
  { id: 'fixed', label: 'Fixed', emoji: '🐛', description: 'Bug fixes' },
  { id: 'security', label: 'Security', emoji: '🔒', description: 'Vulnerability fixes' },
];

interface ChangeEntry {
  id: string;
  type: ChangeType;
  description: string;
  pr?: string;
  author?: string;
}

interface Release {
  version: string;
  date: string;
  changes: ChangeEntry[];
}

export default function ChangelogGenerator() {
  const [version, setVersion] = useState('1.0.0');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [releases, setReleases] = useState<Release[]>([{
    version: '1.0.0',
    date: new Date().toISOString().split('T')[0],
    changes: [],
  }]);
  const [currentReleaseIndex, setCurrentReleaseIndex] = useState(0);
  const [format, setFormat] = useState<'markdown' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState('');

  const currentRelease = releases[currentReleaseIndex];

  const addChange = useCallback((type: ChangeType) => {
    const newChange: ChangeEntry = {
      id: crypto.randomUUID(),
      type,
      description: '',
      pr: '',
      author: '',
    };
    setReleases(prev => prev.map((r, i) => 
      i === currentReleaseIndex ? { ...r, changes: [...r.changes, newChange] } : r
    ));
  }, [currentReleaseIndex]);

  const updateChange = useCallback((changeId: string, field: keyof ChangeEntry, value: string) => {
    setReleases(prev => prev.map((r, i) => 
      i === currentReleaseIndex 
        ? { ...r, changes: r.changes.map(c => c.id === changeId ? { ...c, [field]: value } : c) }
        : r
    ));
  }, [currentReleaseIndex]);

  const removeChange = useCallback((changeId: string) => {
    setReleases(prev => prev.map((r, i) => 
      i === currentReleaseIndex 
        ? { ...r, changes: r.changes.filter(c => c.id !== changeId) }
        : r
    ));
  }, [currentReleaseIndex]);

  const addRelease = useCallback(() => {
    const newRelease: Release = {
      version: '',
      date: new Date().toISOString().split('T')[0],
      changes: [],
    };
    setReleases(prev => [...prev, newRelease]);
    setCurrentReleaseIndex(prev => prev + 1);
  }, []);

  const removeRelease = useCallback((index: number) => {
    if (releases.length <= 1) return;
    setReleases(prev => prev.filter((_, i) => i !== index));
    setCurrentReleaseIndex(prev => Math.min(prev, releases.length - 2));
  }, [releases.length]);

  const generateChangelog = useCallback(() => {
    if (format === 'markdown') {
      let md = '# Changelog\n\n';
      md += 'All notable changes to this project will be documented in this file.\n\n';
      md += 'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\n';
      md += 'and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n';
      
      for (const release of releases) {
        if (!release.version.trim()) continue;
        
        md += `## [${release.version}] - ${release.date}\n\n`;
        
        const grouped = CHANGE_TYPES.map(t => ({
          type: t,
          entries: release.changes.filter(c => c.type === t.id && c.description.trim())
        })).filter(g => g.entries.length > 0);
        
        for (const group of grouped) {
          md += `### ${group.type.emoji} ${group.type.label}\n\n`;
          for (const change of group.entries) {
            let line = `- ${change.description}`;
            if (change.pr?.trim()) line += ` (#${change.pr})`;
            if (change.author?.trim()) line += ` — @${change.author}`;
            md += `${line}\n`;
          }
          md += '\n';
        }
      }
      
      setOutput(md);
    } else {
      const jsonOutput = releases
        .filter(r => r.version.trim())
        .map(r => ({
          version: r.version,
          date: r.date,
          changes: r.changes
            .filter(c => c.description.trim())
            .map(c => ({
              type: c.type,
              description: c.description,
              pr: c.pr || undefined,
              author: c.author || undefined,
            }))
        }));
      setOutput(JSON.stringify(jsonOutput, null, 2));
    }
  }, [releases, format]);

  const copyToClipboard = useCallback(async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const loadExample = useCallback(() => {
    setVersion('2.1.0');
    setDate(new Date().toISOString().split('T')[0]);
    setReleases([
      {
        version: '2.1.0',
        date: new Date().toISOString().split('T')[0],
        changes: [
          { id: crypto.randomUUID(), type: 'added', description: 'Add dark mode toggle in settings', pr: '123', author: 'johndoe' },
          { id: crypto.randomUUID(), type: 'added', description: 'Support for custom themes via CSS variables', pr: '125', author: 'janedoe' },
          { id: crypto.randomUUID(), type: 'changed', description: 'Improve keyboard navigation in modal dialogs', pr: '118', author: 'johndoe' },
          { id: crypto.randomUUID(), type: 'fixed', description: 'Fix memory leak in WebSocket connection handler', pr: '120', author: 'bobsmith' },
          { id: crypto.randomUUID(), type: 'fixed', description: 'Correct timestamp parsing in UTC timezone', pr: '122', author: 'alicechen' },
          { id: crypto.randomUUID(), type: 'security', description: 'Update dependencies to patch CVE-2024-12345', pr: '124', author: 'security-bot' },
        ],
      },
      {
        version: '2.0.0',
        date: '2024-01-15',
        changes: [
          { id: crypto.randomUUID(), type: 'added', description: 'Complete rewrite of authentication system', pr: '100', author: 'johndoe' },
          { id: crypto.randomUUID(), type: 'added', description: 'New plugin architecture for extensions', pr: '105', author: 'janedoe' },
          { id: crypto.randomUUID(), type: 'changed', description: 'Migrate from REST to GraphQL API', pr: '95', author: 'bobsmith' },
          { id: crypto.randomUUID(), type: 'deprecated', description: 'Deprecate legacy v1 API endpoints', pr: '98', author: 'johndoe' },
          { id: crypto.randomUUID(), type: 'removed', description: 'Remove support for IE11', pr: '110', author: 'alicechen' },
          { id: crypto.randomUUID(), type: 'fixed', description: 'Fix race condition in cache invalidation', pr: '88', author: 'bobsmith' },
        ],
      },
      {
        version: '1.5.2',
        date: '2023-11-20',
        changes: [
          { id: crypto.randomUUID(), type: 'fixed', description: 'Fix crash on empty input in parser', pr: '85', author: 'johndoe' },
          { id: crypto.randomUUID(), type: 'fixed', description: 'Correct off-by-one error in pagination', pr: '87', author: 'janedoe' },
        ],
      },
    ]);
    setCurrentReleaseIndex(0);
  }, []);

  const clearAll = useCallback(() => {
    setReleases([{
      version: '',
      date: new Date().toISOString().split('T')[0],
      changes: [],
    }]);
    setCurrentReleaseIndex(0);
    setOutput('');
  }, []);

  const stats = useMemo(() => {
    const totalChanges = releases.reduce((sum, r) => sum + r.changes.filter(c => c.description.trim()).length, 0);
    const byType = CHANGE_TYPES.map(t => ({
      ...t,
      count: releases.reduce((sum, r) => sum + r.changes.filter(c => c.type === t.id && c.description.trim()).length, 0)
    })).filter(t => t.count > 0);
    return { totalChanges, byType };
  }, [releases]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Changelog Generator</h2>
        <p className="tool-desc">Create professional changelogs following the Keep a Changelog format. Organize changes by type (Added, Changed, Deprecated, Removed, Fixed, Security) with version management.</p>
      </div>

      <div className="changelog-generator">
        <div className="release-tabs">
          <div className="tabs-header">
            {releases.map((r, i) => (
              <button
                key={i}
                className={i === currentReleaseIndex ? 'active' : ''}
                onClick={() => setCurrentReleaseIndex(i)}
              >
                {r.version || `v${i + 1} (draft)`}
                <span className="close-btn" onClick={e => { e.stopPropagation(); removeRelease(i); }}>×</span>
              </button>
            ))}
            <button className="add-tab" onClick={addRelease} title="Add new release">+</button>
          </div>
        </div>

        <div className="release-editor">
          <div className="release-meta">
            <div className="form-field">
              <label>Version:</label>
              <input
                type="text"
                value={currentRelease.version}
                onChange={e => setReleases(prev => prev.map((r, i) => i === currentReleaseIndex ? { ...r, version: e.target.value } : r))}
                placeholder="e.g., 2.1.0"
              />
            </div>
            <div className="form-field">
              <label>Release Date:</label>
              <input
                type="date"
                value={currentRelease.date}
                onChange={e => setReleases(prev => prev.map((r, i) => i === currentReleaseIndex ? { ...r, date: e.target.value } : r))}
              />
            </div>
          </div>

          <div className="changes-section">
            <h3>Changes</h3>
            <div className="type-buttons">
              {CHANGE_TYPES.map(t => (
                <button
                  key={t.id}
                  className="type-btn"
                  onClick={() => addChange(t.id)}
                  title={t.description}
                >
                  <span className="emoji">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {currentRelease.changes.map(change => (
              <div key={change.id} className="change-entry">
                <span className="change-type-badge" style={{ backgroundColor: getTypeColor(change.type) }}>
                  {CHANGE_TYPES.find(t => t.id === change.type)?.emoji} {CHANGE_TYPES.find(t => t.id === change.type)?.label}
                </span>
                <input
                  type="text"
                  value={change.description}
                  onChange={e => updateChange(change.id, 'description', e.target.value)}
                  placeholder="What changed? (e.g., Add dark mode support)"
                  className="change-desc"
                />
                <input
                  type="text"
                  value={change.pr}
                  onChange={e => updateChange(change.id, 'pr', e.target.value)}
                  placeholder="PR/Issue #"
                  className="change-pr"
                />
                <input
                  type="text"
                  value={change.author}
                  onChange={e => updateChange(change.id, 'author', e.target.value)}
                  placeholder="Author"
                  className="change-author"
                />
                <button 
                  className="btn-icon" 
                  onClick={() => removeChange(change.id)}
                  title="Remove"
                >
                  🗑️
                </button>
              </div>
            ))}

            {currentRelease.changes.length === 0 && (
              <div className="empty-state">
                Click a type button above to add your first change
              </div>
            )}
          </div>
        </div>

        <div className="output-section">
          <div className="output-controls">
            <div className="format-selector">
              <label>Format:</label>
              <select value={format} onChange={e => setFormat(e.target.value as 'markdown' | 'json')}>
                <option value="markdown">Markdown</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div className="button-group">
              <button className="primary-btn" onClick={generateChangelog}>
                Generate Changelog
              </button>
              <button className="secondary-btn" onClick={loadExample}>
                Load Example
              </button>
              <button className="secondary-btn" onClick={clearAll}>
                Clear All
              </button>
            </div>
          </div>

          <div className="output-header">
            <h3>Generated Changelog</h3>
            <button 
              className={copied ? 'copy-btn copied' : 'copy-btn'} 
              onClick={copyToClipboard}
              disabled={!output}
            >
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
          </div>

          <div className="output-preview">
            {output ? (
              format === 'markdown' ? (
                <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: markdownToHtml(output) }} />
              ) : (
                <pre className="json-output"><code>{output}</code></pre>
              )
            ) : (
              <div className="placeholder">
                Fill in releases and changes, then click "Generate Changelog"
              </div>
            )}
          </div>

          {stats.totalChanges > 0 && (
            <div className="stats-section">
              <h4>Summary: {stats.totalChanges} changes across {releases.filter(r => r.version.trim()).length} releases</h4>
              <div className="stats-grid">
                {stats.byType.map(t => (
                  <div key={t.id} className="stat-item">
                    <span className="stat-emoji">{t.emoji}</span>
                    <span className="stat-label">{t.label}</span>
                    <span className="stat-count">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="help-section">
        <details>
          <summary>Keep a Changelog Guide</summary>
          <div className="help-content">
            <h4>Format</h4>
            <p>Changelogs follow the <a href="https://keepachangelog.com/en/1.0.0/" target="_blank" rel="noopener">Keep a Changelog</a> format with these sections:</p>
            <ul>
              <li><strong>Added</strong> — New features</li>
              <li><strong>Changed</strong> — Changes in existing functionality</li>
              <li><strong>Deprecated</strong> — Soon-to-be removed features</li>
              <li><strong>Removed</strong> — Now removed features</li>
              <li><strong>Fixed</strong> — Bug fixes</li>
              <li><strong>Security</strong> — Vulnerability fixes</li>
            </ul>

            <h4>Versioning</h4>
            <p>Follow <a href="https://semver.org/" target="_blank" rel="noopener">Semantic Versioning</a> (MAJOR.MINOR.PATCH):</p>
            <ul>
              <li><strong>MAJOR</strong> — Incompatible API changes</li>
              <li><strong>MINOR</strong> — Backward-compatible functionality</li>
              <li><strong>PATCH</strong> — Backward-compatible bug fixes</li>
            </ul>

            <h4>Best Practices</h4>
            <ul>
              <li>Group changes by type, not by commit or PR</li>
              <li>Use past tense: "Add dark mode" not "Added dark mode"</li>
              <li>Link to PRs/issues: <code>(#123)</code></li>
              <li>Credit authors: <code>— @username</code></li>
              <li>Order releases newest first</li>
              <li>Use "Unreleased" section for upcoming changes</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}

function getTypeColor(type: ChangeType): string {
  const colors: Record<ChangeType, string> = {
    added: '#10b981',
    changed: '#3b82f6',
    deprecated: '#f59e0b',
    removed: '#ef4444',
    fixed: '#8b5cf6',
    security: '#ec4899',
  };
  return colors[type];
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
    .replace(/<p><h([1-3])>/g, '<h$1>')
    .replace(/<\/h([1-3])><\/p>/g, '</h$1>')
    .replace(/<p><ul>/g, '<ul>')
    .replace(/<\/ul><\/p>/g, '</ul>')
    .replace(/<p><code>/g, '<code>')
    .replace(/<\/code><\/p>/g, '</code>');
}