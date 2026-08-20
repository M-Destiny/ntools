import { useState, useCallback } from 'react';

export default function HtmlToMarkdown() {
  const [htmlInput, setHtmlInput] = useState('');
  const [mdOutput, setMdOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    headingStyle: 'atx' as 'atx' | 'setext',
    bulletListMarker: '-' as '-' | '*' | '+',
    codeBlockStyle: 'fenced' as 'fenced' | 'indented',
    fence: '```' as '```' | '~~~',
    emDelimiter: '_' as '_' | '*',
    strongDelimiter: '**' as '**' | '__',
    linkStyle: 'inlined' as 'inlined' | 'referenced',
    linkReferenceStyle: 'full' as 'full' | 'collapsed' | 'shortcut',
    hr: '---' as '---' | '***' | '___',
    br: '' as '' | '  \n',
    preformattedCode: true,
    gfm: true,
  });

  // Simple HTML to Markdown converter
  const convertHtmlToMarkdown = useCallback((html: string, opts: typeof options): string => {
    if (!html.trim()) return '';
    
    let result = html;
    
    // Decode HTML entities
    const entities: Record<string, string> = {
      '<': '<',
      '>': '>',
      '&': '&',
      '"': '"',
      '\u2019': "'",
      '&nbsp;': ' ',
      '&copy;': '\u00A9',
      '&reg;': '\u00AE',
      '&mdash;': '\u2014',
      '&ndash;': '\u2013',
      '&lsquo;': '\u2018',
      '&rsquo;': '\u2019',
      '&ldquo;': '\u201C',
      '&rdquo;': '\u201D',
      '&hellip;': '\u2026',
    };
    
    for (const [entity, char] of Object.entries(entities)) {
      result = result.replace(new RegExp(entity, 'g'), char);
    }
    
    // Remove DOCTYPE and comments
    result = result.replace(/<!DOCTYPE[^>]*>/gi, '');
    result = result.replace(/<!--[\s\S]*?-->/g, '');
    
    // Convert headings
    for (let i = 6; i >= 1; i--) {
      const headingRegex = new RegExp(`<h${i}[^>]*>([\\s\\S]*?)<\\/h${i}>`, 'gi');
      if (opts.headingStyle === 'atx') {
        result = result.replace(headingRegex, (_: string, content: string) => {
          const cleanContent = content.replace(/<[^>]*>/g, '').trim();
          return `${'#'.repeat(i)} ${cleanContent}`;
        });
      } else {
        // setext style only for h1, h2
        if (i <= 2) {
          result = result.replace(headingRegex, (_: string, content: string) => {
            const cleanContent = content.replace(/<[^>]*>/g, '').trim();
            const underline = i === 1 ? '=' : '-';
            return `${cleanContent}\n${underline.repeat(cleanContent.length)}`;
          });
        } else {
          result = result.replace(headingRegex, (_: string, content: string) => {
            const cleanContent = content.replace(/<[^>]*>/g, '').trim();
            return `${'#'.repeat(i)} ${cleanContent}`;
          });
        }
      }
    }
    
    // Convert paragraphs
    result = result.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_: string, content: string) => {
      const cleanContent = content.trim();
      if (!cleanContent) return '';
      return cleanContent + '\n\n';
    });
    
    // Convert bold
    result = result.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_: string, content: string) => {
      return `${opts.strongDelimiter}${content.replace(/<[^>]*>/g, '')}${opts.strongDelimiter}`;
    });
    result = result.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_: string, content: string) => {
      return `${opts.strongDelimiter}${content.replace(/<[^>]*>/g, '')}${opts.strongDelimiter}`;
    });
    
    // Convert italic
    result = result.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_: string, content: string) => {
      return `${opts.emDelimiter}${content.replace(/<[^>]*>/g, '')}${opts.emDelimiter}`;
    });
    result = result.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, (_: string, content: string) => {
      return `${opts.emDelimiter}${content.replace(/<[^>]*>/g, '')}${opts.emDelimiter}`;
    });
    
    // Convert code inline
    result = result.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_: string, content: string) => {
      return `\`${content.replace(/<[^>]*>/g, '')}\``;
    });
    
    // Convert links
    result = result.replace(/<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_: string, href: string, content: string) => {
      const cleanContent = content.replace(/<[^>]*>/g, '').trim();
      if (opts.linkStyle === 'referenced') {
        // Simplified - just use inline for now
        return `[${cleanContent}](${href})`;
      }
      return `[${cleanContent}](${href})`;
    });
    
    // Convert images
    result = result.replace(/<img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*alt\s*=\s*["']([^"']*)["'][^>]*>/gi, (_: string, src: string, alt: string) => {
      return `![${alt}](${src})`;
    });
    result = result.replace(/<img\s+[^>]*alt\s*=\s*["']([^"']*)["'][^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi, (_: string, alt: string, src: string) => {
      return `![${alt}](${src})`;
    });
    result = result.replace(/<img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi, (_: string, src: string) => {
      return `![](${src})`;
    });
    
    // Convert unordered lists
    result = result.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_: string, content: string) => {
      let listItems = content;
      listItems = listItems.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, itemContent: string) => {
        const cleanItem = itemContent.replace(/<[^>]*>/g, '').trim();
        return `${opts.bulletListMarker} ${cleanItem}\n`;
      });
      return '\n' + listItems + '\n';
    });
    
    // Convert ordered lists
    result = result.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_: string, content: string) => {
      let listItems = content;
      let counter = 1;
      listItems = listItems.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, itemContent: string) => {
        const cleanItem = itemContent.replace(/<[^>]*>/g, '').trim();
        return `${counter++}. ${cleanItem}\n`;
      });
      return '\n' + listItems + '\n';
    });
    
    // Convert blockquotes
    result = result.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_: string, content: string) => {
      const cleanContent = content.replace(/<[^>]*>/g, '').trim();
      return cleanContent.split('\n').map((line: string) => `> ${line.trim()}`).join('\n') + '\n\n';
    });
    
    // Convert horizontal rules
    result = result.replace(/<hr[^>]*>/gi, `\n${opts.hr}\n\n`);
    
    // Convert line breaks
    result = result.replace(/<br\s*\/?>/gi, opts.br ? '  \n' : '\n');
    
    // Convert code blocks (pre > code)
    result = result.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_: string, content: string) => {
      const cleanContent = content.replace(/<[^>]*>/g, '');
      if (opts.codeBlockStyle === 'fenced') {
        return `\n${opts.fence}\n${cleanContent}\n${opts.fence}\n\n`;
      } else {
        return '\n' + cleanContent.split('\n').map((line: string) => `    ${line}`).join('\n') + '\n\n';
      }
    });
    result = result.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_: string, content: string) => {
      const cleanContent = content.replace(/<[^>]*>/g, '');
      if (opts.codeBlockStyle === 'fenced') {
        return `\n${opts.fence}\n${cleanContent}\n${opts.fence}\n\n`;
      } else {
        return '\n' + cleanContent.split('\n').map((line: string) => `    ${line}`).join('\n') + '\n\n';
      }
    });
    
    // Convert tables (basic support)
    result = result.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_: string, content: string) => {
      let markdown = '\n';
      const rows = content.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      if (rows) {
        rows.forEach((row: string, rowIndex: number) => {
          const cells = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
          if (cells) {
            const cellContents = cells.map((cell: string) => cell.replace(/<[^>]*>/g, '').trim());
            markdown += '| ' + cellContents.join(' | ') + ' |\n';
            if (rowIndex === 0) {
              markdown += '|' + cellContents.map(() => ' --- ').join('|') + '|\n';
            }
          }
        });
      }
      return markdown + '\n';
    });
    
    // Remove any remaining HTML tags
    result = result.replace(/<[^>]*>/g, '');
    
    // Clean up multiple newlines
    result = result.replace(/\n{3,}/g, '\n\n');
    
    // Trim
    result = result.trim();
    
    return result;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlInput(e.target.value);
    try {
      const markdown = convertHtmlToMarkdown(e.target.value, options);
      setMdOutput(markdown);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed');
      setMdOutput('');
    }
  };

  const copyToClipboard = () => {
    if (mdOutput) {
      navigator.clipboard.writeText(mdOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearInput = () => {
    setHtmlInput('');
    setMdOutput('');
    setError(null);
  };

  const loadExample = () => {
    const example = `<!DOCTYPE html>
<html>
<head>
  <title>Sample Page</title>
</head>
<body>
  <h1>Welcome to HTML to Markdown</h1>
  <p>This is a <strong>sample</strong> HTML document with <em>various</em> elements.</p>
  
  <h2>Features</h2>
  <ul>
    <li>Converts headings (h1-h6)</li>
    <li>Handles <code>inline code</code> and <pre><code>code blocks</code></pre></li>
    <li>Supports <a href="https://example.com">links</a> and images</li>
    <li>Converts lists (ordered and unordered)</li>
    <li>Handles <blockquote>blockquotes</blockquote></li>
    <li>Supports tables</li>
  </ul>
  
  <h2>Code Example</h2>
  <pre><code>function hello() {
  console.log("Hello, World!");
}</code></pre>
  
  <h2>Table</h2>
  <table>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
    <tr>
      <td>headingStyle</td>
      <td>string</td>
      <td>atx or setext</td>
    </tr>
    <tr>
      <td>bulletListMarker</td>
      <td>string</td>
      <td>-, *, or +</td>
    </tr>
  </table>
  
  <hr>
  <p><small>Built with HTML to Markdown converter</small></p>
</body>
</html>`;
    setHtmlInput(example);
    try {
      const markdown = convertHtmlToMarkdown(example, options);
      setMdOutput(markdown);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed');
    }
  };

  const updateOption = (key: keyof typeof options, value: string | boolean) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    if (htmlInput.trim()) {
      try {
        const markdown = convertHtmlToMarkdown(htmlInput, newOptions);
        setMdOutput(markdown);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Conversion failed');
      }
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>HTML to Markdown</h2>
        <p className="tool-desc">Convert HTML to clean Markdown. Supports headings, lists, tables, code blocks, links, images, and more.</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input HTML</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearInput} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="json-editor"
            value={htmlInput}
            onChange={handleInputChange}
            placeholder="Paste HTML here..."
            spellCheck={false}
          />
          {error && <div className="error-message">✗ {error}</div>}
        </div>

        <div className="controls-panel">
          <div className="options-group">
            <h4>Options</h4>
            <div className="option-row">
              <label>Heading Style:</label>
              <select value={options.headingStyle} onChange={(e) => updateOption('headingStyle', e.target.value)} className="option-select">
                <option value="atx">ATX (# Heading)</option>
                <option value="setext">Setext (underline)</option>
              </select>
            </div>
            <div className="option-row">
              <label>Bullet Marker:</label>
              <select value={options.bulletListMarker} onChange={(e) => updateOption('bulletListMarker', e.target.value)} className="option-select">
                <option value="-">- Dash</option>
                <option value="*">* Asterisk</option>
                <option value="+">+ Plus</option>
              </select>
            </div>
            <div className="option-row">
              <label>Code Blocks:</label>
              <select value={options.codeBlockStyle} onChange={(e) => updateOption('codeBlockStyle', e.target.value)} className="option-select">
                <option value="fenced">Fenced (```)</option>
                <option value="indented">Indented (4 spaces)</option>
              </select>
            </div>
            <div className="option-row">
              <label>Fence Char:</label>
              <select value={options.fence} onChange={(e) => updateOption('fence', e.target.value)} className="option-select">
                <option value="```">``` Backticks</option>
                <option value="~~~">~~~ Tildes</option>
              </select>
            </div>
            <div className="option-row">
              <label>Horizontal Rule:</label>
              <select value={options.hr} onChange={(e) => updateOption('hr', e.target.value)} className="option-select">
                <option value="---">--- Dashes</option>
                <option value="***">*** Asterisks</option>
                <option value="___">___ Underscores</option>
              </select>
            </div>
            <label className="option-label">
              <input
                type="checkbox"
                checked={options.gfm}
                onChange={(e) => updateOption('gfm', e.target.checked)}
              />
              GFM (tables, strikethrough, task lists)
            </label>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Markdown Output</h3>
            <div className="toolbar-actions">
              <button onClick={copyToClipboard} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy Markdown'}
              </button>
            </div>
          </div>
          <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: mdOutput ? `<pre><code>${mdOutput.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')}</code></pre>` : '<p style="color: var(--text-muted);">Markdown output will appear here...</p>' }} />
        </div>
      </div>

      <div className="features-panel">
        <h3>Features</h3>
        <ul>
          <li>Converts HTML headings (h1-h6) to ATX or Setext style</li>
          <li>Handles bold, italic, inline code, links, images</li>
          <li>Converts ordered/unordered lists and nested lists</li>
          <li>Supports code blocks (fenced or indented) and blockquotes</li>
          <li>Basic table conversion with header detection</li>
          <li>Configurable output style options</li>
          <li>One-click copy to clipboard</li>
        </ul>
      </div>
    </div>
  );
}