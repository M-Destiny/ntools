import { useState, useEffect, useRef } from 'react';

export default function MermaidLiveEditor() {
  const [mermaidCode, setMermaidCode] = useState(`graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
    E --> F((Finish))`);
  const [rendered, setRendered] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'default' | 'dark' | 'forest' | 'neutral'>('default');
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Dynamically import mermaid
    import('mermaid').then((mermaid) => {
      mermaid.default.initialize({
        startOnLoad: false,
        theme: theme,
        securityLevel: 'loose',
        flowchart: { useMaxWidth: true, htmlLabels: true },
      });
      renderMermaid(mermaid.default);
    }).catch(() => {
      setError('Failed to load Mermaid library');
    });
  }, []);

  const renderMermaid = async (mermaid: any) => {
    if (!containerRef.current) return;
    setError(null);
    try {
      const id = 'mermaid-' + Date.now();
      containerRef.current.innerHTML = `<div class="mermaid" id="${id}">${mermaidCode}</div>`;
      await mermaid.run({ nodes: [document.getElementById(id)!] });
      setRendered(containerRef.current.innerHTML);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Render error');
    }
  };

  useEffect(() => {
    if (!initializedRef.current) return;
    import('mermaid').then((mermaid) => {
      mermaid.default.initialize({
        startOnLoad: false,
        theme: theme,
        securityLevel: 'loose',
        flowchart: { useMaxWidth: true, htmlLabels: true },
      });
      renderMermaid(mermaid.default);
    });
  }, [mermaidCode, theme]);

  const loadExample = (type: string) => {
    const examples: Record<string, string> = {
      flowchart: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
      sequence: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: Great! Thanks for asking.
    Alice->>Bob: How about you?
    Bob-->>Alice: I'm doing well too!`,
      class: `classDiagram
    class Animal {
      +String name
      +makeSound()
    }
    class Dog {
      +bark()
    }
    class Cat {
      +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
      gantt: `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Design
    Requirements     :done, des1, 2026-01-01, 2026-01-07
    UI Design        :active, des2, 2026-01-08, 2026-01-21
    section Development
    Backend          :dev1, 2026-01-22, 2026-02-18
    Frontend         :dev2, 2026-02-19, 2026-03-18`,
      pie: `pie showData
    title Technology Stack
    "React" : 40
    "TypeScript" : 30
    "Node.js" : 20
    "Other" : 10`,
      er: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
      string name
      string email
    }
    ORDER {
      int id
      date orderDate
    }
    LINE-ITEM {
      int quantity
      float price
    }`,
    };
    setMermaidCode(examples[type] || examples.flowchart);
  };

  const copySvg = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (svg) {
      navigator.clipboard.writeText(svg.outerHTML);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadSvg = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mermaid-diagram.svg';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadPng = () => {
    const svg = containerRef.current?.querySelector('svg');
    if (svg) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob!);
          a.download = 'mermaid-diagram.png';
          a.click();
          URL.revokeObjectURL(a.href);
        });
      };
      img.src = url;
    }
  };

  const clearAll = () => {
    setMermaidCode('');
    setRendered('');
    setError(null);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Mermaid Live Editor</h2>
        <p className="tool-desc">Write Mermaid diagrams on the left, see live preview on the right. Export as SVG or PNG.</p>
      </div>

      <div className="mermaid-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Mermaid Code</h3>
            <div className="toolbar-actions">
              <select
                onChange={(e) => loadExample(e.target.value)}
                defaultValue="flowchart"
                className="example-select"
              >
                <option value="flowchart">Flowchart</option>
                <option value="sequence">Sequence Diagram</option>
                <option value="class">Class Diagram</option>
                <option value="gantt">Gantt Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="er">Entity Relationship</option>
              </select>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="mermaid-editor"
            value={mermaidCode}
            onChange={(e) => setMermaidCode(e.target.value)}
            placeholder="Write Mermaid syntax here..."
            spellCheck={false}
          />
          {error && <div className="error-message">✗ {error}</div>}
        </div>

        <div className="preview-panel">
          <div className="preview-toolbar">
            <h3>Live Preview</h3>
            <div className="preview-actions">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="theme-select"
              >
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="forest">Forest</option>
                <option value="neutral">Neutral</option>
              </select>
              <button onClick={copySvg} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy SVG'}
              </button>
              <button onClick={downloadSvg} className="btn-secondary">Download SVG</button>
              <button onClick={downloadPng} className="btn-secondary">Download PNG</button>
            </div>
          </div>
          <div
            ref={containerRef}
            className="mermaid-preview"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
          {!rendered && !error && (
            <div className="preview-placeholder">
              <p>Diagram will appear here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}