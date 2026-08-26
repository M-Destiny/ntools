import { useState, useMemo } from 'react';

interface SelectorResult {
  selector: string;
  specificity: [number, number, number];
  score: number;
  parts: {
    ids: string[];
    classes: string[];
    elements: string[];
  };
  valid: boolean;
  error?: string;
}

export default function CSSSpecificityCalculator() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<SelectorResult[]>([]);

  const parseSelector = useMemo(() => {
    const lines = input.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const selector = line.trim();
      if (!selector) {
        return {
          selector: '',
          specificity: [0, 0, 0] as [number, number, number],
          score: 0,
          parts: { ids: [], classes: [], elements: [] },
          valid: false,
          error: 'Empty selector'
        };
      }

      try {
        const { specificity, parts } = calculateSpecificity(selector);
        const score = specificity[0] * 10000 + specificity[1] * 100 + specificity[2];
        return {
          selector,
          specificity,
          score,
          parts,
          valid: true
        };
      } catch (e) {
        return {
          selector,
          specificity: [0, 0, 0] as [number, number, number],
          score: 0,
          parts: { ids: [], classes: [], elements: [] },
          valid: false,
          error: e instanceof Error ? e.message : 'Invalid selector'
        };
      }
    });
  }, [input]);

  const calculateSpecificity = (selector: string): { specificity: [number, number, number]; parts: { ids: string[]; classes: string[]; elements: string[] } } => {
    // Split by commas for selector groups, take the highest specificity
    const selectorGroups = selector.split(',').map(s => s.trim());
    
    let maxSpecificity: [number, number, number] = [0, 0, 0];
    let maxParts = { ids: [] as string[], classes: [] as string[], elements: [] as string[] };

    for (const group of selectorGroups) {
      const { specificity, parts } = calculateSingleSelectorSpecificity(group);
      const score = specificity[0] * 10000 + specificity[1] * 100 + specificity[2];
      const maxScore = maxSpecificity[0] * 10000 + maxSpecificity[1] * 100 + maxSpecificity[2];
      
      if (score > maxScore) {
        maxSpecificity = specificity;
        maxParts = parts;
      }
    }

    return { specificity: maxSpecificity, parts: maxParts };
  };

  const calculateSingleSelectorSpecificity = (selector: string): { specificity: [number, number, number]; parts: { ids: string[]; classes: string[]; elements: string[] } } => {
    const ids: string[] = [];
    const classes: string[] = [];
    const elements: string[] = [];

    // Remove pseudo-elements (::before, ::after, etc.) - they count as elements
    let workingSelector = selector.replace(/::[a-z-]+/gi, ' *');
    
    // Handle pseudo-classes (:hover, :focus, :nth-child, etc.) - they count as classes
        workingSelector = workingSelector.replace(/:([a-z-]+)(\\([^)]*\\))?/gi, (_match, name) => {
          if (name && !['not', 'is', 'where', 'has', 'host', 'host-context', 'slotted'].includes(name.toLowerCase())) {
            classes.push(':' + name);
          }
          return ' *';
        });

    // Handle :not(), :is(), :where(), :has() - their contents contribute to specificity
    workingSelector = workingSelector.replace(/(?::not|:is|:where|:has)\(([^)]+)\)/gi, (match) => {
      // :where() has 0 specificity, others take the max of their arguments
      if (match.toLowerCase().startsWith(':where')) {
        return ' *';
      }
      // For :not(), :is(), :has() - we'd need to compute max, simplified here
      return ' *';
    });

    // Find IDs (#id)
    const idMatches = workingSelector.match(/#[a-zA-Z][\w-]*/g);
    if (idMatches) {
      ids.push(...idMatches);
    }

    // Find classes (.class)
    const classMatches = workingSelector.match(/\.[a-zA-Z][\w-]*/g);
    if (classMatches) {
      classes.push(...classMatches);
    }

    // Find attribute selectors ([attr], [attr=value], etc.)
    const attrMatches = workingSelector.match(/\[[^\]]+\]/g);
    if (attrMatches) {
      classes.push(...attrMatches);
    }

    // Find element selectors (tag names)
    // This is simplified - we look for word boundaries that aren't preceded by . # [ :
    const elementPattern = /\b([a-z][a-z0-9-]*)\b/gi;
    let elementMatch;
    while ((elementMatch = elementPattern.exec(workingSelector)) !== null) {
      const tag = elementMatch[1].toLowerCase();
      // Skip pseudo-classes and known non-elements
      const before = workingSelector[elementMatch.index - 1];
      const after = workingSelector[elementMatch.index + elementMatch[0].length];
      if (before !== '.' && before !== '#' && before !== '[' && before !== ':' && 
          after !== '(' && after !== '[' && !['not', 'is', 'where', 'has', 'hover', 'focus', 'active', 'visited', 'link', 'first-child', 'last-child', 'nth-child', 'nth-of-type', 'first-of-type', 'last-of-type', 'only-child', 'only-of-type', 'empty', 'root', 'target', 'enabled', 'disabled', 'checked', 'optional', 'required', 'valid', 'invalid', 'in-range', 'out-of-range', 'read-only', 'read-write', 'placeholder-shown', 'default', 'focus-visible', 'focus-within'].includes(tag)) {
        elements.push(tag);
      }
    }

    const specificity: [number, number, number] = [
      ids.length,
      classes.length,
      elements.length
    ];

    return { specificity, parts: { ids, classes, elements } };
  };

  const formatSpecificity = (spec: [number, number, number]) => {
    return `${spec[0]},${spec[1]},${spec[2]}`;
  };

  const copyAll = () => {
    const text = results
      .filter(r => r.valid)
      .map(r => `${r.selector} → ${formatSpecificity(r.specificity)} (${r.specificity[0]} IDs, ${r.specificity[1]} Classes/Attr/Pseudo, ${r.specificity[2]} Elements)`)
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  const clearInput = () => {
    setInput('');
    setResults([]);
  };

  // Example selectors
  const examples = [
    'button',
    '.button',
    '#button',
    'button.primary',
    'button#submit.primary',
    'ul li a:hover',
    'div > p + span',
    'input[type="text"]',
    '#header .nav li a::before',
    ':not(.disabled)',
    ':is(h1, h2, h3)',
    ':where(.foo, .bar)',
    '.a.b.c.d.e.f.g.h.i.j'
  ];

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>CSS Specificity Calculator</h2>
        <p className="tool-desc">Calculate and compare CSS selector specificity. Enter one selector per line.</p>
      </div>

      <div className="tool-grid">
        <div className="input-panel">
          <label htmlFor="selector-input">CSS Selectors (one per line)</label>
          <textarea
            id="selector-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={examples.join('\n')}
            className="selector-input"
            rows={12}
          />
          <div className="input-actions">
            <button onClick={clearInput} className="secondary-btn">Clear</button>
            <button onClick={copyAll} disabled={results.filter(r => r.valid).length === 0} className="secondary-btn">
              Copy Results
            </button>
          </div>
          
          <details className="examples-section">
            <summary>Example Selectors (click to fill)</summary>
            <div className="example-grid">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setInput(ex)}
                  className="example-btn"
                  title={ex}
                >
                  {ex.length > 25 ? ex.slice(0, 22) + '...' : ex}
                </button>
              ))}
            </div>
          </details>
        </div>

        <div className="results-panel">
          <h3>Results</h3>
          
          {parseSelector.length === 0 && (
            <p className="empty-state">Enter CSS selectors to calculate specificity</p>
          )}
          
          {parseSelector.length > 0 && (
            <div className="results-table">
              <table>
                <thead>
                  <tr>
                    <th>Selector</th>
                    <th>Specificity</th>
                    <th>IDs</th>
                    <th>Classes/Attr/Pseudo</th>
                    <th>Elements</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {parseSelector.map((result, index) => (
                    <tr key={index} className={result.valid ? '' : 'invalid'}>
                      <td className="selector-cell">
                        <code>{result.selector}</code>
                        {!result.valid && result.error && (
                          <span className="error-tooltip" title={result.error}>⚠</span>
                        )}
                      </td>
                      <td className="specificity-cell">
                        <span className="specificity-badge">{formatSpecificity(result.specificity)}</span>
                      </td>
                      <td>{result.parts.ids.length}</td>
                      <td>{result.parts.classes.length}</td>
                      <td>{result.parts.elements.length}</td>
                      <td className="score-cell">{result.score.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {parseSelector.length > 1 && (
            <div className="comparison">
              <h4>Highest Specificity</h4>
              <div className="winner">
                {(() => {
                  const validResults = parseSelector.filter(r => r.valid);
                  if (validResults.length === 0) return <span>No valid selectors</span>;
                  const winner = validResults.reduce((max, r) => 
                    r.score > max.score ? r : max
                  );
                  return (
                    <div className="winner-card">
                      <code>{winner.selector}</code>
                      <span className="winner-spec">{formatSpecificity(winner.specificity)}</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          <details className="reference-section">
            <summary>Specificity Reference</summary>
            <div className="reference-content">
              <h5>Specificity Hierarchy (highest to lowest)</h5>
              <ul>
                <li><strong>Inline styles</strong> — 1,0,0,0 (not calculated here)</li>
                <li><strong>IDs</strong> — #id (1,0,0)</li>
                <li><strong>Classes, Attributes, Pseudo-classes</strong> — .class, [attr], :hover (0,1,0)</li>
                <li><strong>Elements, Pseudo-elements</strong> — div, ::before (0,0,1)</li>
                <li><strong>Universal selector</strong> — * (0,0,0)</li>
                <li><strong>Combinators</strong> — +, {'>'}, ~, space (0,0,0)</li>
              </ul>
              <h5>Special Cases</h5>
              <ul>
                <li><strong>:where()</strong> — Always 0 specificity</li>
                <li><strong>:is(), :not(), :has()</strong> — Takes specificity of most specific argument</li>
                <li><strong>:not()</strong> with complex selector — Uses argument's specificity</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}