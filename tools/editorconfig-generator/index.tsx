import { useState } from 'react';

export default function EditorConfigGenerator() {
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const config = {
    root: true,
    // General
    indent_style: 'space',
    indent_size: 2,
    end_of_line: 'lf',
    charset: 'utf-8',
    trim_trailing_whitespace: true,
    insert_final_newline: true,
    // Override patterns
    overrides: [
      {
        patterns: ['*.md', '*.markdown'],
        settings: { trim_trailing_whitespace: false },
      },
      {
        patterns: ['*.{yml,yaml}'],
        settings: { indent_size: 2 },
      },
      {
        patterns: ['*.json'],
        settings: { indent_size: 2 },
      },
      {
        patterns: ['*.{ts,tsx,js,jsx}'],
        settings: { indent_size: 2 },
      },
      {
        patterns: ['*.py'],
        settings: { indent_size: 4 },
      },
      {
        patterns: ['*.go'],
        settings: { indent_style: 'tab', indent_size: 4 },
      },
      {
        patterns: ['*.rs'],
        settings: { indent_size: 4 },
      },
      {
        patterns: ['*.java'],
        settings: { indent_size: 4 },
      },
      {
        patterns: ['*.cs'],
        settings: { indent_size: 4 },
      },
      {
        patterns: ['Makefile', '*.mk'],
        settings: { indent_style: 'tab' },
      },
      {
        patterns: ['*.{sh,bash,zsh,fish}'],
        settings: { indent_size: 2 },
      },
      {
        patterns: ['*.{html,htm,xml,svg}'],
        settings: { indent_size: 2 },
      },
      {
        patterns: ['*.{css,scss,sass,less}'],
        settings: { indent_size: 2 },
      },
      {
        patterns: ['*.{toml,ini,cfg,conf}'],
        settings: { indent_size: 2 },
      },
      {
        patterns: ['Dockerfile*'],
        settings: { indent_size: 2 },
      },
      {
        patterns: ['*.{sql,proto}'],
        settings: { indent_size: 2 },
      },
    ],
  };

  const presets = {
    'default': { ...config },
    'web': { 
      ...config, 
      indent_size: 2,
      overrides: config.overrides.filter(o => ['*.{ts,tsx,js,jsx}', '*.{html,htm,xml,svg}', '*.{css,scss,sass,less}', '*.json', '*.{yml,yaml}'].some(p => o.patterns.includes(p)))
    },
    'python': { 
      ...config, 
      indent_size: 4,
      overrides: config.overrides.filter(o => ['*.py', '*.{toml,ini,cfg,conf}', '*.{sh,bash,zsh,fish}'].some(p => o.patterns.includes(p)))
    },
    'go': { 
      ...config, 
      indent_style: 'tab', 
      indent_size: 4,
      overrides: config.overrides.filter(o => ['*.go', '*.{sh,bash,zsh,fish}', '*.{toml,ini,cfg,conf}'].some(p => o.patterns.includes(p)))
    },
    'rust': { 
      ...config, 
      indent_size: 4,
      overrides: config.overrides.filter(o => ['*.rs', '*.{toml,ini,cfg,conf}', '*.{sh,bash,zsh,fish}'].some(p => o.patterns.includes(p)))
    },
    'minimal': { 
      root: true, 
      indent_style: 'space', 
      indent_size: 2, 
      end_of_line: 'lf', 
      charset: 'utf-8', 
      trim_trailing_whitespace: true, 
      insert_final_newline: true,
      overrides: []
    },
  };

  const [preset, setPreset] = useState('default');
  const [form, setForm] = useState({
    root: true,
    indent_style: 'space',
    indent_size: 2,
    end_of_line: 'lf',
    charset: 'utf-8',
    trim_trailing_whitespace: true,
    insert_final_newline: true,
  });

  const generate = () => {
    let content = '# EditorConfig is awesome: https://EditorConfig.org\n\n';
    content += '# top-most EditorConfig file\n';
    content += `root = ${form.root}\n\n`;
    content += `# General settings\n`;
    content += `[*]\n`;
    content += `indent_style = ${form.indent_style}\n`;
    content += `indent_size = ${form.indent_size}\n`;
    content += `end_of_line = ${form.end_of_line}\n`;
    content += `charset = ${form.charset}\n`;
    content += `trim_trailing_whitespace = ${form.trim_trailing_whitespace}\n`;
    content += `insert_final_newline = ${form.insert_final_newline}\n\n`;

    // Add overrides from selected preset
    const selectedPreset = presets[preset as keyof typeof presets];
    if (selectedPreset.overrides.length > 0) {
      selectedPreset.overrides.forEach(override => {
        content += `[${override.patterns.join(',')}]\n`;
        Object.entries(override.settings).forEach(([key, value]) => {
          content += `${key} = ${value}\n`;
        });
        content += '\n';
      });
    }

    setOutput(content);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.editorconfig';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePresetChange = (p: string) => {
    setPreset(p);
    const selectedPreset = presets[p as keyof typeof presets];
    setForm({
      root: selectedPreset.root,
      indent_style: selectedPreset.indent_style,
      indent_size: selectedPreset.indent_size,
      end_of_line: selectedPreset.end_of_line,
      charset: selectedPreset.charset,
      trim_trailing_whitespace: selectedPreset.trim_trailing_whitespace,
      insert_final_newline: selectedPreset.insert_final_newline,
    });
    generate();
  };

  // Generate on mount
  if (!output) generate();

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>.editorconfig Generator</h2>
        <p className="tool-desc">Generate consistent EditorConfig files for cross-editor coding style. Choose a preset or customize settings.</p>
      </div>

      <div className="editorconfig-layout">
        <div className="options-panel">
          <div className="preset-selector">
            <h3>Preset</h3>
            <div className="preset-buttons">
              {(Object.keys(presets) as Array<keyof typeof presets>).map(p => (
                <button
                  key={p}
                  className={preset === p ? 'active' : ''}
                  onClick={() => handlePresetChange(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-grid">
            <div className="setting-group">
              <h3>General</h3>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.root}
                  onChange={e => setForm(prev => ({ ...prev, root: e.target.checked }))}
                />
                root = true (top-most config)
              </label>
            </div>

            <div className="setting-group">
              <h3>Indentation</h3>
              <div className="field-row">
                <label>Style</label>
                <select
                  value={form.indent_style}
                  onChange={e => setForm(prev => ({ ...prev, indent_style: e.target.value }))}
                >
                  <option value="space">space</option>
                  <option value="tab">tab</option>
                </select>
              </div>
              <div className="field-row">
                <label>Size</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={form.indent_size}
                  onChange={e => setForm(prev => ({ ...prev, indent_size: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="setting-group">
              <h3>Line Endings & Encoding</h3>
              <div className="field-row">
                <label>End of Line</label>
                <select
                  value={form.end_of_line}
                  onChange={e => setForm(prev => ({ ...prev, end_of_line: e.target.value }))}
                >
                  <option value="lf">LF (Unix/Linux/macOS)</option>
                  <option value="crlf">CRLF (Windows)</option>
                  <option value="cr">CR (Classic Mac)</option>
                </select>
              </div>
              <div className="field-row">
                <label>Charset</label>
                <select
                  value={form.charset}
                  onChange={e => setForm(prev => ({ ...prev, charset: e.target.value }))}
                >
                  <option value="utf-8">UTF-8</option>
                  <option value="utf-16be">UTF-16BE</option>
                  <option value="utf-16le">UTF-16LE</option>
                  <option value="latin1">Latin-1</option>
                </select>
              </div>
            </div>

            <div className="setting-group">
              <h3>Whitespace</h3>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.trim_trailing_whitespace}
                  onChange={e => setForm(prev => ({ ...prev, trim_trailing_whitespace: e.target.checked }))}
                />
                Trim trailing whitespace
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.insert_final_newline}
                  onChange={e => setForm(prev => ({ ...prev, insert_final_newline: e.target.checked }))}
                />
                Insert final newline
              </label>
            </div>

            <div className="actions">
              <button className="btn-primary" onClick={generate}>Generate</button>
              <button className="btn-secondary" onClick={copyToClipboard} disabled={!output}>
                {copied ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
              <button className="btn-secondary" onClick={download} disabled={!output}>
                Download .editorconfig
              </button>
            </div>
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-header">
            <h3>Preview</h3>
            <span className="line-count">{output.split('\n').length} lines</span>
          </div>
          <pre className="preview-output"><code>{output || 'Click Generate to preview'}</code></pre>
        </div>
      </div>
    </div>
  );
}