import { useState, useEffect } from 'react';

export default function MarkdownEditor() {
  const [content, setContent] = useState('# Welcome to Markdown Editor\n\nStart typing **markdown** here...\n\n## Features\n\n- Live preview\n- Syntax highlighting\n- Export to HTML\n- Word count\n- Auto-save to localStorage\n\n```javascript\nconsole.log("Code blocks work too!");\n```\n\n| Tables | Are | Supported |\n|--------|-----|-----------|\n| Yes    | ✓   | ✓         |');
  const [preview, setPreview] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('markdown-editor-content');
    if (stored) {
      setContent(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('markdown-editor-content', content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Simple markdown to HTML conversion
    let html = content
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><h([1-6])>(.*?)<\/h[1-6]><\/p>/g, '<h$1>$2</h$1>');
    html = html.replace(/<p><li>(.*?)<\/li><\/p>/g, '<li>$1</li>');
    html = html.replace(/<p><pre>/g, '<pre>');
    html = html.replace(/<\/pre><\/p>/g, '</pre>');

    setPreview(html);

    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(content.length);
  }, [content]);

  const copyHtml = () => {
    navigator.clipboard.writeText(preview);
  };

  const downloadMd = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 4px; font-family: monospace; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; padding: 0; color: inherit; }
    blockquote { border-left: 4px solid #ddd; margin: 1rem 0; padding-left: 1rem; color: #666; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    th { background: #f4f4f4; }
  </style>
</head>
<body>${preview}</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearContent = () => {
    setContent('');
    localStorage.removeItem('markdown-editor-content');
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Markdown Editor</h2>
        <p className="tool-desc">Live markdown editor with preview, word count, and export options</p>
      </div>

      <div className="editor-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Editor</h3>
            <div className="toolbar-actions">
              <button onClick={downloadMd} className="btn-secondary">📥 Download .md</button>
              <button onClick={downloadHtml} className="btn-secondary">📄 Download .html</button>
              <button onClick={clearContent} className="btn-danger">Clear</button>
            </div>
          </div>
          <textarea
            className="markdown-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write markdown here..."
            spellCheck={true}
          />
          <div className="editor-status">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            {saved && <span className="saved-indicator">✓ Auto-saved</span>}
          </div>
        </div>

        {showPreview && (
          <div className="editor-panel preview-panel">
            <div className="editor-toolbar">
              <h3>Preview</h3>
              <div className="toolbar-actions">
                <button onClick={copyHtml} className="btn-secondary">📋 Copy HTML</button>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={showPreview}
                    onChange={(e) => setShowPreview(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <div
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        )}
      </div>

      <style>{`
        .tool-container {
          padding: 1rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        .tool-header {
          margin-bottom: 1.5rem;
        }
        .tool-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 0.25rem;
        }
        .tool-desc {
          color: #64748b;
        }
        .editor-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .editor-panel {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .preview-panel {
          background: #fafafa;
        }
        .editor-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .editor-toolbar h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .toolbar-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .markdown-editor {
          flex: 1;
          border: none;
          outline: none;
          resize: none;
          padding: 1rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          color: #1e293b;
          min-height: 500px;
        }
        .markdown-editor::placeholder {
          color: #94a3b8;
        }
        .markdown-preview {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          min-height: 500px;
          color: #1e293b;
          line-height: 1.7;
        }
        .markdown-preview h1 { font-size: 2rem; margin: 1.5rem 0 1rem; color: #1a1a2e; }
        .markdown-preview h2 { font-size: 1.5rem; margin: 1.5rem 0 0.75rem; color: #1a1a2e; }
        .markdown-preview h3 { font-size: 1.25rem; margin: 1.25rem 0 0.5rem; color: #334155; }
        .markdown-preview p { margin: 0.75rem 0; }
        .markdown-preview ul, .markdown-preview ol { margin: 0.75rem 0; padding-left: 1.5rem; }
        .markdown-preview li { margin: 0.25rem 0; }
        .markdown-preview blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; margin: 1rem 0; color: #64748b; font-style: italic; }
        .markdown-preview code { background: #f1f5f9; padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.875em; }
        .markdown-preview pre { background: #0f172a; color: #e2e8f0; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; }
        .markdown-preview pre code { background: none; padding: 0; color: inherit; font-size: 0.875rem; }
        .markdown-preview table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .markdown-preview th, .markdown-preview td { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }
        .markdown-preview th { background: #f8fafc; font-weight: 600; }
        .markdown-preview strong { color: #1a1a2e; }
        .markdown-preview em { color: #475569; }
        .editor-status {
          display: flex;
          gap: 1.5rem;
          padding: 0.75rem 1rem;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 0.75rem;
          color: #64748b;
        }
        .saved-indicator {
          color: #22c55e;
          font-weight: 500;
        }
        .btn-secondary {
          padding: 0.5rem 1rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-secondary:hover {
          background: #e2e8f0;
        }
        .btn-danger {
          padding: 0.5rem 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-danger:hover {
          background: #fee2e2;
        }
        .toggle {
          position: relative;
          width: 44px;
          height: 24px;
        }
        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #cbd5e1;
          transition: 0.2s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: white;
          transition: 0.2s;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .toggle input:checked + .slider {
          background: #3b82f6;
        }
        .toggle input:checked + .slider:before {
          transform: translateX(20px);
        }

        @media (max-width: 900px) {
          .editor-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}