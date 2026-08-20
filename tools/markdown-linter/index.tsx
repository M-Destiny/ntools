import { useState, useMemo, useCallback } from 'react';

interface LintRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  check: (lines: string[], lineIndex: number) => LintIssue | null;
}

interface LintIssue {
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  severity: 'error' | 'warning' | 'info';
  ruleId: string;
  message: string;
  fix?: {
    description: string;
    replacement: string;
  };
}

const LINT_RULES: LintRule[] = [
  {
    id: 'MD001',
    name: 'Heading levels should only increment by one level at a time',
    description: 'Headings should not skip levels (e.g., h1 to h3)',
    severity: 'warning',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      const headingMatch = line.match(/^(#+)\s/);
      if (!headingMatch) return null;
      
      const level = headingMatch[1].length;
      let prevLevel = 0;
      
      for (let i = lineIndex - 1; i >= 0; i--) {
        const prevMatch = lines[i].match(/^(#+)\s/);
        if (prevMatch) {
          prevLevel = prevMatch[1].length;
          break;
        }
      }
      
      if (prevLevel > 0 && level > prevLevel + 1) {
        return {
          line: lineIndex + 1,
          column: 1,
          severity: 'warning',
          ruleId: 'MD001',
          message: `Heading level should not increment by more than one level (found h${level} after h${prevLevel})`,
        };
      }
      return null;
    },
  },
  {
    id: 'MD003',
    name: 'Heading style',
    description: 'Heading style should be consistent (ATX style with #)',
    severity: 'warning',
    check: (lines, lineIndex) => {
      // Check for setext style headings (underlined with === or ---)
      if (lineIndex + 1 < lines.length) {
        const nextLine = lines[lineIndex + 1];
        if (/^=+$/.test(nextLine.trim()) || /^-+$/.test(nextLine.trim())) {
          return {
            line: lineIndex + 1,
            column: 1,
            severity: 'warning',
            ruleId: 'MD003',
            message: 'Use ATX style headings (#) instead of setext style (underlined)',
          };
        }
      }
      return null;
    },
  },
  {
    id: 'MD004',
    name: 'Unordered list style',
    description: 'Unordered list markers should be consistent',
    severity: 'warning',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      const listMatch = line.match(/^(\s*)([-*+])\s/);
      if (!listMatch) return null;
      
      const marker = listMatch[2];
      // Check other list items in the same list
      let expectedMarker = marker;
      for (let i = 0; i < lines.length; i++) {
        const otherMatch = lines[i].match(/^(\s*)([-*+])\s/);
        if (otherMatch && otherMatch[1] === listMatch[1]) {
          if (otherMatch[2] !== expectedMarker) {
            return {
              line: lineIndex + 1,
              column: listMatch[1].length + 1,
              severity: 'warning',
              ruleId: 'MD004',
              message: `Unordered list marker should be consistent (expected '${expectedMarker}', found '${marker}')`,
            };
          }
        }
      }
      return null;
    },
  },
  {
    id: 'MD007',
    name: 'Unordered list indentation',
    description: 'Unordered list items should be indented by 2 or 4 spaces',
    severity: 'warning',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      const match = line.match(/^(\s*)([-*+])\s/);
      if (!match) return null;
      
      const indent = match[1].length;
      if (indent % 2 !== 0 && indent % 4 !== 0) {
        return {
          line: lineIndex + 1,
          column: 1,
          severity: 'warning',
          ruleId: 'MD007',
          message: `Unordered list item indentation should be 2 or 4 spaces (found ${indent})`,
        };
      }
      return null;
    },
  },
  {
    id: 'MD009',
    name: 'Trailing spaces',
    description: 'Lines should not have trailing whitespace',
    severity: 'warning',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      if (/\s+$/.test(line)) {
        return {
          line: lineIndex + 1,
          column: line.trimEnd().length + 1,
          severity: 'warning',
          ruleId: 'MD009',
          message: 'Trailing spaces',
          fix: {
            description: 'Remove trailing spaces',
            replacement: line.trimEnd(),
          },
        };
      }
      return null;
    },
  },
  {
    id: 'MD010',
    name: 'Hard tabs',
    description: 'Hard tabs should not be used',
    severity: 'error',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      if (line.includes('\t')) {
        return {
          line: lineIndex + 1,
          column: line.indexOf('\t') + 1,
          severity: 'error',
          ruleId: 'MD010',
          message: 'Hard tabs should not be used (use spaces instead)',
          fix: {
            description: 'Replace tabs with spaces',
            replacement: line.replace(/\t/g, '  '),
          },
        };
      }
      return null;
    },
  },
  {
    id: 'MD012',
    name: 'Multiple consecutive blank lines',
    description: 'Multiple consecutive blank lines should be collapsed',
    severity: 'warning',
    check: (lines, lineIndex) => {
      if (lineIndex < 2) return null;
      const line = lines[lineIndex];
      const prev1 = lines[lineIndex - 1];
      const prev2 = lines[lineIndex - 2];
      
      if (line.trim() === '' && prev1.trim() === '' && prev2.trim() === '') {
        return {
          line: lineIndex + 1,
          column: 1,
          severity: 'warning',
          ruleId: 'MD012',
          message: 'Multiple consecutive blank lines',
        };
      }
      return null;
    },
  },
  {
    id: 'MD013',
    name: 'Line length',
    description: 'Lines should not exceed a certain length',
    severity: 'warning',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      if (line.length > 100) {
        // Skip headings, code blocks, tables
        if (line.startsWith('#') || line.startsWith('```') || line.startsWith('|')) {
          return null;
        }
        return {
          line: lineIndex + 1,
          column: 101,
          severity: 'warning',
          ruleId: 'MD013',
          message: `Line length exceeds 100 characters (${line.length})`,
        };
      }
      return null;
    },
  },
  {
    id: 'MD018',
    name: 'No space after hash on atx style heading',
    description: 'There should be a space after the hash on ATX style headings',
    severity: 'warning',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      const match = line.match(/^(#+)([^#\s])/);
      if (match) {
        return {
          line: lineIndex + 1,
          column: match[1].length + 1,
          severity: 'warning',
          ruleId: 'MD018',
          message: 'Missing space after heading hashes',
          fix: {
            description: 'Add space after hashes',
            replacement: match[1] + ' ' + line.slice(match[1].length),
          },
        };
      }
      return null;
    },
  },
  {
    id: 'MD019',
    name: 'Multiple spaces after hash on atx style heading',
    description: 'There should only be one space after the hash on ATX style headings',
    severity: 'warning',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      const match = line.match(/^(#+)  +/);
      if (match) {
        return {
          line: lineIndex + 1,
          column: match[1].length + 1,
          severity: 'warning',
          ruleId: 'MD019',
          message: 'Multiple spaces after heading hashes',
          fix: {
            description: 'Reduce to single space',
            replacement: match[1] + ' ' + line.slice(match[1].length).trimStart(),
          },
        };
      }
      return null;
    },
  },
  {
    id: 'MD022',
    name: 'Headings should be surrounded by blank lines',
    description: 'Headings should have blank lines before and after',
    severity: 'warning',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      const match = line.match(/^#+\s/);
      if (!match) return null;
      
      const issues: LintIssue[] = [];
      
      // Check before
      if (lineIndex > 0 && lines[lineIndex - 1].trim() !== '') {
        issues.push({
          line: lineIndex + 1,
          column: 1,
          severity: 'warning',
          ruleId: 'MD022',
          message: 'Heading should be preceded by a blank line',
        });
      }
      
      // Check after
      if (lineIndex + 1 < lines.length && lines[lineIndex + 1].trim() !== '') {
        issues.push({
          line: lineIndex + 1,
          column: 1,
          severity: 'warning',
          ruleId: 'MD022',
          message: 'Heading should be followed by a blank line',
        });
      }
      
      return issues[0] || null;
    },
  },
  {
    id: 'MD025',
    name: 'Single top-level heading',
    description: 'Document should have only one top-level heading (h1)',
    severity: 'warning',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      const match = line.match(/^#\s/);
      if (!match) return null;
      
      // Check if there's another h1
      for (let i = 0; i < lines.length; i++) {
        if (i !== lineIndex && lines[i].match(/^#\s/)) {
          return {
            line: lineIndex + 1,
            column: 1,
            severity: 'warning',
            ruleId: 'MD025',
            message: 'Document should have only one top-level heading (h1)',
          };
        }
      }
      return null;
    },
  },
  {
    id: 'MD031',
    name: 'Fenced code blocks should be surrounded by blank lines',
    description: 'Fenced code blocks should have blank lines before and after',
    severity: 'warning',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      if (!line.startsWith('```')) return null;
      
      const isOpening = lineIndex === 0 || !lines[lineIndex - 1].startsWith('```');
      const isClosing = lineIndex + 1 >= lines.length || !lines[lineIndex + 1].startsWith('```');
      
      if (isOpening && lineIndex > 0 && lines[lineIndex - 1].trim() !== '') {
        return {
          line: lineIndex + 1,
          column: 1,
          severity: 'warning',
          ruleId: 'MD031',
          message: 'Fenced code block should be preceded by a blank line',
        };
      }
      
      if (isClosing && lineIndex + 1 < lines.length && lines[lineIndex + 1].trim() !== '') {
        return {
          line: lineIndex + 1,
          column: 1,
          severity: 'warning',
          ruleId: 'MD031',
          message: 'Fenced code block should be followed by a blank line',
        };
      }
      return null;
    },
  },
  {
    id: 'MD033',
    name: 'Inline HTML',
    description: 'Inline HTML should not be used',
    severity: 'warning',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      // Skip HTML comments
      if (line.includes('<!--')) return null;
      
      // Simple check for HTML tags (not markdown)
      const htmlTagRegex = /<[a-z][\s\S]*?>/gi;
      const matches = [...line.matchAll(htmlTagRegex)];
      
      // Allow common markdown-compatible tags
      const allowedTags = ['br', 'hr', 'img', 'a', 'code', 'pre', 'kbd', 'samp', 'var', 'details', 'summary'];
      
      for (const match of matches) {
        const tag = match[0].match(/<\/?([a-z]+)/i);
        if (tag && !allowedTags.includes(tag[1].toLowerCase())) {
          return {
            line: lineIndex + 1,
            column: match.index! + 1,
            severity: 'warning',
            ruleId: 'MD033',
            message: `Inline HTML tag '<${tag[1]}'> should not be used`,
          };
        }
      }
      return null;
    },
  },
  {
    id: 'MD034',
    name: 'Bare URL used',
    description: 'Bare URLs should be wrapped in angle brackets or markdown links',
    severity: 'warning',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      // Skip if already in a link or code
      if (line.includes('](') || line.includes('`')) return null;
      
      const urlRegex = /\bhttps?:\/\/[^\s\)\]\}]+/g;
      const matches = [...line.matchAll(urlRegex)];
      
      if (matches.length > 0) {
        return {
          line: lineIndex + 1,
          column: matches[0].index! + 1,
          severity: 'warning',
          ruleId: 'MD034',
          message: 'Bare URL used; wrap in angle brackets <...> or use markdown link syntax',
        };
      }
      return null;
    },
  },
  {
    id: 'MD040',
    name: 'Fenced code blocks should have a language specified',
    description: 'Fenced code blocks should specify the language',
    severity: 'info',
    check: (lines, lineIndex) => {
      const line = lines[lineIndex];
      if (line === '```') {
        return {
          line: lineIndex + 1,
          column: 1,
          severity: 'info',
          ruleId: 'MD040',
          message: 'Fenced code block should have a language specified (e.g., ```js)',
        };
      }
      return null;
    },
  },
  {
    id: 'MD041',
    name: 'First line should be a top-level heading',
    description: 'First non-blank line should be a top-level heading',
    severity: 'warning',
    check: (lines, lineIndex) => {
      if (lineIndex !== 0) return null;
      if (!lines[0].match(/^#\s/)) {
        return {
          line: 1,
          column: 1,
          severity: 'warning',
          ruleId: 'MD041',
          message: 'First line should be a top-level heading (h1)',
        };
      }
      return null;
    },
  },
];

export default function MarkdownLinter() {
  const [input, setInput] = useState(`# Welcome to Markdown Linter

## This is a heading

This paragraph has trailing spaces.   
And this line is way too long to be considered good markdown practice because it exceeds the recommended line length of 100 characters which makes it hard to read and maintain.

### This heading skips a level (h1 to h3)

- Item 1
- Item 2
  - Nested item
* Different marker

\`\`\`
code without language
\`\`\`

Check out https://example.com for more info.

<font color="red">This HTML should be avoided</font>

## Another heading
Content here.
`);
  const [issues, setIssues] = useState<LintIssue[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [copied, setCopied] = useState(false);

  const lint = useCallback((text: string) => {
    const lines = text.split('\n');
    const allIssues: LintIssue[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      for (const rule of LINT_RULES) {
        const issue = rule.check(lines, i);
        if (issue) {
          allIssues.push(issue);
        }
      }
    }
    
    setIssues(allIssues);
  }, []);

  const filteredIssues = useMemo(() => {
    if (selectedSeverity === 'all') return issues;
    return issues.filter(i => i.severity === selectedSeverity);
  }, [issues, selectedSeverity]);

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInput(newText);
    lint(newText);
  };

  const copyReport = () => {
    const report = filteredIssues.map(issue => 
      `[${issue.severity.toUpperCase()}] Line ${issue.line}: ${issue.message} (${issue.ruleId})`
    ).join('\n');
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyFixes = () => {
    let lines = input.split('\n');
    const fixableIssues = filteredIssues.filter(i => i.fix).sort((a, b) => b.line - a.line);
    
    for (const issue of fixableIssues) {
      if (issue.fix && issue.line - 1 < lines.length) {
        lines[issue.line - 1] = issue.fix.replacement;
      }
    }
    
    const fixedText = lines.join('\n');
    setInput(fixedText);
    lint(fixedText);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Markdown Linter</h2>
        <p className="tool-desc">Lint your Markdown files with 15+ rules. Detects heading issues, spacing, formatting, and best practice violations.</p>
      </div>

      <div className="linter-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Markdown Input</h3>
            <div className="toolbar-actions">
              <select
                value={selectedSeverity}
                onChange={e => setSelectedSeverity(e.target.value as any)}
                className="severity-filter"
              >
                <option value="all">All Issues</option>
                <option value="error">Errors Only</option>
                <option value="warning">Warnings Only</option>
                <option value="info">Info Only</option>
              </select>
              <button className="btn-secondary" onClick={applyFixes} disabled={!filteredIssues.some(i => i.fix)}>
                Auto-Fix ({filteredIssues.filter(i => i.fix).length})
              </button>
              <button className="btn-secondary" onClick={copyReport} disabled={filteredIssues.length === 0}>
                Copy Report
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={handleInputChange}
            className="markdown-input"
            placeholder="Paste or type your Markdown here..."
            spellCheck={false}
            rows={25}
          />
          <div className="stats-bar">
            <span className={errorCount > 0 ? 'error' : ''}>✗ Errors: {errorCount}</span>
            <span className={warningCount > 0 ? 'warning' : ''}>⚠ Warnings: {warningCount}</span>
            <span className={infoCount > 0 ? 'info' : ''}>ℹ Info: {infoCount}</span>
            <span>Lines: {input.split('\n').length}</span>
            <span>Chars: {input.length}</span>
          </div>
        </div>

        <div className="issues-panel">
          <div className="issues-toolbar">
            <h3>Lint Results ({filteredIssues.length})</h3>
            {copied && <span className="copy-toast">✓ Report copied!</span>}
          </div>
          
          {filteredIssues.length === 0 ? (
            <div className="empty-state">
              <p>✓ No issues found! Your Markdown looks great.</p>
            </div>
          ) : (
            <div className="issues-list">
              {filteredIssues.map((issue, index) => (
                <div key={index} className={`issue-item ${issue.severity}`}>
                  <div className="issue-header">
                    <span className={`severity-badge ${issue.severity}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                    <span className="issue-rule">{issue.ruleId}</span>
                    <span className="issue-line">Line {issue.line}</span>
                  </div>
                  <div className="issue-message">{issue.message}</div>
                  {issue.fix && (
                    <button 
                      className="btn-fix"
                      onClick={() => {
                        let lines = input.split('\n');
                        lines[issue.line - 1] = issue.fix!.replacement;
                        const fixed = lines.join('\n');
                        setInput(fixed);
                        lint(fixed);
                      }}
                    >
                      Apply Fix: {issue.fix.description}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="help-section">
        <details>
          <summary>Markdown Linter Guide</summary>
          <div className="help-content">
            <h4>Supported Rules</h4>
            <ul>
              {LINT_RULES.map(rule => (
                <li key={rule.id}>
                  <strong>{rule.id} ({rule.name})</strong> — {rule.description}
                  <span className={`rule-severity ${rule.severity}`}>{rule.severity}</span>
                </li>
              ))}
            </ul>

            <h4>Features</h4>
            <ul>
              <li>Real-time linting as you type</li>
              <li>15+ common Markdown rules (MD001, MD003, MD004, MD007, MD009, MD010, MD012, MD013, MD018, MD019, MD022, MD025, MD031, MD033, MD034, MD040, MD041)</li>
              <li>Auto-fix for common issues (trailing spaces, tabs, heading spacing, etc.)</li>
              <li>Filter by severity (errors, warnings, info)</li>
              <li>Copy lint report to clipboard</li>
              <li>Line/column positions for each issue</li>
            </ul>

            <h4>Usage</h4>
            <ol>
              <li>Paste your Markdown in the editor</li>
              <li>Review issues in the right panel</li>
              <li>Click "Auto-Fix" to automatically fix fixable issues</li>
              <li>Or click individual "Apply Fix" buttons</li>
              <li>Copy the report for CI/CD integration</li>
            </ol>
          </div>
        </details>
      </div>
    </div>
  );
}