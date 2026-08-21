import { useState, useMemo } from 'react';

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    indent: '  ',
    keywordCase: 'upper' as 'upper' | 'lower' | 'preserve',
    indentStyle: 'standard' as 'standard' | 'tabular',
    linesBetweenQueries: 1,
    maxLineLength: 80,
  });

  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON',
    'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'EXCEPT',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'INDEX',
    'VIEW', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'CONSTRAINT', 'PRIMARY KEY', 'FOREIGN KEY',
    'REFERENCES', 'DEFAULT', 'NOT NULL', 'UNIQUE', 'CHECK', 'AUTO_INCREMENT',
    'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'TRUE', 'FALSE',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AS', 'DISTINCT', 'ALL', 'TOP',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'CAST', 'CONVERT',
    'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'SAVEPOINT',
    'WITH', 'RECURSIVE', 'CTE', 'OVER', 'PARTITION BY', 'ROW_NUMBER', 'RANK', 'DENSE_RANK',
    'LEAD', 'LAG', 'FIRST_VALUE', 'LAST_VALUE',
  ];

  const formatSQL = (sql: string, opts: typeof options): string => {
    if (!sql.trim()) return '';

    let result = sql;

    // Normalize whitespace first
    result = result.replace(/\s+/g, ' ').trim();

    // Split by semicolon to handle multiple queries
    const queries = result.split(';').filter(q => q.trim());
    const formattedQueries = queries.map(query => {
      let formatted = formatSingleQuery(query.trim(), opts);
      return formatted;
    });

    return formattedQueries.join(';\n'.repeat(opts.linesBetweenQueries));
  };

  const formatSingleQuery = (sql: string, opts: typeof options): string => {
    let result = sql;

    // Apply keyword casing
    const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
    result = result.replace(keywordPattern, (match) => {
      if (opts.keywordCase === 'upper') return match.toUpperCase();
      if (opts.keywordCase === 'lower') return match.toLowerCase();
      return match;
    });

    // Basic formatting - add newlines before major keywords
    const majorKeywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
      'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'EXCEPT',
      'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE',
      'WITH', 'ON', 'AND', 'OR'
    ];

    // Replace commas with comma + newline + indent
    result = result.replace(/,/g, ',\n' + opts.indent);

    // Add newlines before major keywords (but not inside function calls)
    majorKeywords.forEach(keyword => {
      const upperKeyword = keyword.toUpperCase();
      const lowerKeyword = keyword.toLowerCase();
      const regex = new RegExp(`\\s+(${upperKeyword}|${lowerKeyword})\\b`, 'g');
      result = result.replace(regex, '\n' + opts.indent + '$1');
    });

    // Handle parentheses - indent content
    result = result.replace(/\(/g, '(\n' + opts.indent + opts.indent);
    result = result.replace(/\)/g, '\n' + opts.indent + ')');

    // Handle CASE statements
    result = result.replace(/\bWHEN\b/g, '\n' + opts.indent + opts.indent + 'WHEN');
    result = result.replace(/\bTHEN\b/g, ' THEN');
    result = result.replace(/\bELSE\b/g, '\n' + opts.indent + opts.indent + 'ELSE');
    result = result.replace(/\bEND\b/g, '\n' + opts.indent + 'END');

    // Clean up multiple newlines
    result = result.replace(/\n{3,}/g, '\n\n');

    // Trim each line
    result = result.split('\n').map(line => line.trimEnd()).join('\n');

    return result;
  };

  const processedOutput = useMemo(() => {
    if (!input.trim()) return '';
    try {
      return formatSQL(input, options);
    } catch (e) {
      return 'Error: ' + (e as Error).message;
    }
  }, [input, options]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(processedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    const sample = `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01' AND u.status = 'active'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 10;`;

    setInput(sample);
  };

  const clearAll = () => {
    setInput('');
  };

  const stats = useMemo(() => {
    if (!input || !processedOutput) return null;
    return {
      originalLines: input.split('\n').length,
      formattedLines: processedOutput.split('\n').length,
      characters: processedOutput.length,
    };
  }, [input, processedOutput]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>SQL Formatter</h2>
        <p className="tool-desc">Format and beautify SQL queries with configurable indentation, keyword casing, and layout options.</p>
      </div>

      <div className="tool-grid">
        <div className="input-panel">
          <div className="panel-header">
            <h3>Input SQL</h3>
            <div className="panel-actions">
              <button className="btn btn-secondary" onClick={loadSample}>Load Sample</button>
              <button className="btn btn-secondary" onClick={clearAll}>Clear</button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="code-textarea"
            placeholder="Paste SQL query here..."
            spellCheck={false}
          />
        </div>

        <div className="output-panel">
          <div className="panel-header">
            <h3>Formatted Output</h3>
            <div className="panel-actions">
              <button className="btn btn-primary" onClick={copyToClipboard} disabled={!processedOutput}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            value={processedOutput}
            readOnly
            className="code-textarea"
            placeholder="Formatted SQL will appear here..."
          />
        </div>
      </div>

      <div className="options-panel">
        <h3>Format Options</h3>
        <div className="options-grid">
          <div className="option-group">
            <label>Indentation</label>
            <select
              value={options.indent}
              onChange={(e) => setOptions({ ...options, indent: e.target.value })}
              className="option-select"
            >
              <option value="  ">2 Spaces</option>
              <option value="    ">4 Spaces</option>
              <option value="\t">Tab</option>
            </select>
          </div>
          <div className="option-group">
            <label>Keyword Case</label>
            <select
              value={options.keywordCase}
              onChange={(e) => setOptions({ ...options, keywordCase: e.target.value as typeof options.keywordCase })}
              className="option-select"
            >
              <option value="upper">UPPER CASE</option>
              <option value="lower">lower case</option>
              <option value="preserve">Preserve</option>
            </select>
          </div>
          <div className="option-group">
            <label>Lines Between Queries</label>
            <select
              value={options.linesBetweenQueries}
              onChange={(e) => setOptions({ ...options, linesBetweenQueries: parseInt(e.target.value) })}
              className="option-select"
            >
              <option value="1">1 Line</option>
              <option value="2">2 Lines</option>
              <option value="3">3 Lines</option>
            </select>
          </div>
        </div>
      </div>

      {stats && (
        <div className="stats-panel">
          <div className="stat-item">
            <span className="stat-label">Input Lines</span>
            <span className="stat-value">{stats.originalLines}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Output Lines</span>
            <span className="stat-value">{stats.formattedLines}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Characters</span>
            <span className="stat-value">{stats.characters.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}