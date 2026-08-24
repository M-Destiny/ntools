import { useState, useRef, useEffect } from 'react';

export default function HtmlToText() {
  const [html, setHtml] = useState(`<!DOCTYPE html>
<html>
<head>
    <title>Sample Page</title>
    <meta name="description" content="A sample HTML page">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .highlight { background: yellow; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Welcome to HTML to Text Converter</h1>
            <nav>
                <ul>
                    <li><a href="/home">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </nav>
        </header>

        <main>
            <article>
                <h2>About This Tool</h2>
                <p>This tool converts <strong>HTML</strong> to <em>plain text</em>. It handles:</p>
                <ul>
                    <li>Removing all HTML tags</li>
                    <li>Preserving text content</li>
                    <li>Converting entities (& < >)</li>
                    <li>Handling nested elements</li>
                    <li>Keeping link URLs</li>
                </ul>

                <h2>Code Example</h2>
                <pre><code><div class="example">
  <p>Hello World</p>
</div></code></pre>

                <h2>Table Example</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Tag Removal</td>
                            <td class="highlight">Complete</td>
                        </tr>
                        <tr>
                            <td>Entity Decoding</td>
                            <td class="highlight">Complete</td>
                        </tr>
                        <tr>
                            <td>Link Preservation</td>
                            <td class="highlight">Complete</td>
                        </tr>
                    </tbody>
                </table>

                <blockquote>
                    <p>"Clean text extraction from HTML is essential for content processing."</p>
                    <footer>— Developer Notes</footer>
                </blockquote>
            </article>

            <aside>
                <h3>Sidebar</h3>
                <p>Additional information goes here.</p>
                <form>
                    <label for="email">Subscribe:</label>
                    <input type="email" id="email" placeholder="Enter email">
                    <button type="submit">Submit</button>
                </form>
            </aside>
        </main>

        <footer>
            <p>&copy; 2026 HTML to Text Converter. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>`);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    keepLinks: true,
    keepImages: false,
    decodeEntities: true,
    removeScripts: true,
    removeStyles: true,
    wordWrap: 80
  });

  const convert = () => {
    let text = html;

    // Remove DOCTYPE
    text = text.replace(/<!DOCTYPE[^>]*>/gi, '');

    // Remove scripts
    if (options.removeScripts) {
      text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
    }

    // Remove styles
    if (options.removeStyles) {
      text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
    }

    // Remove comments
    text = text.replace(/<!--[\s\S]*?-->/g, '');

    // Handle links - keep text with URL
    if (options.keepLinks) {
      text = text.replace(/<a\s+[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (match, url, content) => {
        const innerText = content.replace(/<[^>]*>/g, '');
        return `${innerText} (${url})`;
      });
    } else {
      text = text.replace(/<a\s+[^>]*>([\s\S]*?)<\/a>/gi, (match, content) => {
        return content.replace(/<[^>]*>/g, '');
      });
    }

    // Handle images
    if (options.keepImages) {
      text = text.replace(/<img\s+[^>]*alt\s*=\s*["']([^"']*)["'][^>]*>/gi, '[Image: $1]');
      text = text.replace(/<img\s+[^>]*>/gi, '[Image]');
    } else {
      text = text.replace(/<img\s+[^>]*>/gi, '');
    }

    // Replace block elements with newlines
    const blockElements = [
      'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'table', 'tr', 'thead', 'tbody',
      'article', 'section', 'header', 'footer', 'nav',
      'aside', 'main', 'blockquote', 'pre', 'form',
      'fieldset', 'legend', 'dl', 'dt', 'dd', 'br',
      'hr', 'address', 'figcaption', 'figure'
    ];

    blockElements.forEach(tag => {
      const regex = new RegExp(`</?${tag}[^>]*>`, 'gi');
      text = text.replace(regex, '\n');
    });

    // Replace inline elements with space
    const inlineElements = [
      'span', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'small', 'mark', 'del', 'ins', 'sub', 'sup', 'code',
      'kbd', 'samp', 'var', 'cite', 'q', 'abbr', 'dfn',
      'time', 'data', 'bdi', 'bdo', 'ruby', 'rt', 'rp',
      'label', 'button', 'select', 'option', 'optgroup',
      'datalist', 'output', 'progress', 'meter'
    ];

    inlineElements.forEach(tag => {
      const regex = new RegExp(`</?${tag}[^>]*>`, 'gi');
      text = text.replace(regex, ' ');
    });

    // Handle table cells specially
    text = text.replace(/<td[^>]*>/gi, ' | ');
    text = text.replace(/<th[^>]*>/gi, ' | ');
    text = text.replace(/<\/td>/gi, '');
    text = text.replace(/<\/th>/gi, '');

    // Handle line breaks
    text = text.replace(/<br\s*\/?>/gi, '\n');

    // Remove any remaining tags
    text = text.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    if (options.decodeEntities) {
      const entities: Record<string, string> = {
        '&': '&',
        '<': '<',
        '>': '>',
        '"': '"',
        '&apos;': "'",
        '&nbsp;': ' ',
        '&copy;': '©',
        '&reg;': '®',
        '&trade;': '™',
        '&euro;': '€',
        '&pound;': '£',
        '&yen;': '¥',
        '&cent;': '¢',
        '&sect;': '§',
        '&middot;': '·',
        '&bull;': '•',
        '&hellip;': '…',
        '&mdash;': '—',
        '&ndash;': '–',
        '&lsquo;': '\u2018',
        '&rsquo;': '\u2019',
        '&ldquo;': '\u201C',
        '&rdquo;': '\u201D',
        '&laquo;': '«',
        '&raquo;': '»',
        '&times;': '×',
        '&divide;': '÷',
        '&frac14;': '¼',
        '&frac12;': '½',
        '&frac34;': '¾',
        '&deg;': '°',
        '&plusmn;': '±',
        '&micro;': 'µ',
        '&para;': '¶',
        '&middot;': '·',
      };

      Object.entries(entities).forEach(([entity, char]) => {
        text = text.replace(new RegExp(entity, 'g'), char);
      });

      // Numeric entities
      text = text.replace(/&#(\d+);/g, (match, num) => {
        return String.fromCharCode(parseInt(num, 10));
      });
      text = text.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
    }

    // Clean up whitespace
    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/\n\s+\n/g, '\n\n');
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.trim();

    // Word wrap if enabled
    if (options.wordWrap && options.wordWrap > 0) {
      const lines = text.split('\n');
      const wrapped = lines.map(line => {
        if (line.length <= options.wordWrap) return line;
        const words = line.split(' ');
        const result: string[] = [];
        let currentLine = '';
        words.forEach(word => {
          if ((currentLine + ' ' + word).length > options.wordWrap) {
            result.push(currentLine);
            currentLine = word;
          } else {
            currentLine = currentLine ? currentLine + ' ' + word : word;
          }
        });
        if (currentLine) result.push(currentLine);
        return result.join('\n');
      });
      text = wrapped.join('\n');
    }

    setOutput(text);
  };

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadText = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const loadExample = () => {
    setHtml(`<!DOCTYPE html>
<html>
<head>
    <title>Sample Article</title>
</head>
<body>
    <article>
        <h1>Main Article Title</h1>
        <p>This is a <strong>sample article</strong> to demonstrate the HTML to text converter.</p>
        
        <h2>Section 1: Introduction</h2>
        <p>HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser.</p>
        
        <h2>Section 2: Features</h2>
        <ul>
            <li>Removes all HTML tags</li>
            <li>Preserves readable text content</li>
            <li>Decodes HTML entities</li>
            <li>Keeps link URLs in parentheses</li>
            <li>Handles tables and lists</li>
        </ul>
        
        <h2>Section 3: Code Example</h2>
        <pre><code><div class="container">
  <h1>Hello World</h1>
  <p>Welcome to my site</p>
</div></code></pre>
        
        <blockquote>
            <p>Good tools make developers productive.</p>
        </blockquote>
    </article>
</body>
</html>`);
  };

  const clearAll = () => {
    setHtml('');
    setOutput('');
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>HTML to Text</h2>
        <p className="tool-desc">Extract clean plain text from HTML. Removes tags, decodes entities, preserves links.</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>HTML Input</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="json-editor"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="Paste HTML here..."
            spellCheck={false}
          />
        </div>

        <div className="controls-panel">
          <div className="mode-selector">
            <h3>Options</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.keepLinks}
                  onChange={(e) => setOptions({...options, keepLinks: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Keep links (text with URL)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.keepImages}
                  onChange={(e) => setOptions({...options, keepImages: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Keep image alt text</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.decodeEntities}
                  onChange={(e) => setOptions({...options, decodeEntities: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Decode HTML entities</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.removeScripts}
                  onChange={(e) => setOptions({...options, removeScripts: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Remove scripts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.removeStyles}
                  onChange={(e) => setOptions({...options, removeStyles: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Remove styles</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm">Word wrap:</label>
                <input
                  type="number"
                  value={options.wordWrap}
                  onChange={(e) => setOptions({...options, wordWrap: parseInt(e.target.value) || 0})}
                  min="0"
                  max="200"
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                />
                <span className="text-sm">(0 = off)</span>
              </div>
            </div>
          </div>

          <div style={{marginTop: '16px'}}>
            <button onClick={convert} className="btn-primary" style={{width: '100%'}}>
              Convert to Text
            </button>
          </div>

          <div className="stats">
            <span>Input: {html.length} chars</span>
            <span>Output: {output.length} chars</span>
          </div>

          <div className="status">
            {output && <span className="success">✓ Converted successfully</span>}
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Plain Text Output</h3>
            <div className="toolbar-actions">
              <button onClick={copyOutput} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy Output'}
              </button>
              <button onClick={downloadText} className="btn-secondary">Download .txt</button>
            </div>
          </div>
          <textarea
            className="json-editor output"
            value={output}
            readOnly
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}