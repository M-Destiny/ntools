import { useState, useCallback, useEffect } from 'react';

type Language = 'javascript' | 'typescript' | 'json' | 'css' | 'html' | 'markdown' | 'yaml' | 'xml' | 'sql' | 'python';
type FormatMode = 'beautify' | 'minify';

interface FormatResult {
  code: string;
  error?: string;
  stats: {
    inputLines: number;
    outputLines: number;
    inputChars: number;
    outputChars: number;
  };
}

const LANGUAGE_OPTIONS: { value: Language; label: string; extensions: string[] }[] = [
  { value: 'javascript', label: 'JavaScript', extensions: ['.js', '.jsx', '.mjs', '.cjs'] },
  { value: 'typescript', label: 'TypeScript', extensions: ['.ts', '.tsx', '.mts', '.cts'] },
  { value: 'json', label: 'JSON', extensions: ['.json', '.jsonc'] },
  { value: 'css', label: 'CSS', extensions: ['.css', '.scss', '.less'] },
  { value: 'html', label: 'HTML', extensions: ['.html', '.htm', '.xhtml'] },
  { value: 'markdown', label: 'Markdown', extensions: ['.md', '.mdx', '.markdown'] },
  { value: 'yaml', label: 'YAML', extensions: ['.yaml', '.yml'] },
  { value: 'xml', label: 'XML', extensions: ['.xml', '.svg', '.xhtml'] },
  { value: 'sql', label: 'SQL', extensions: ['.sql'] },
  { value: 'python', label: 'Python', extensions: ['.py', '.pyw'] },
];

const EXAMPLES: Record<Language, string> = {
  javascript: `// Example: Modern JavaScript
const fetchUserData = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: Date;
}`,
  typescript: `// Example: TypeScript with generics
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

function createApiClient<T>(baseUrl: string) {
  return {
    async get(endpoint: string): Promise<ApiResponse<T>> {
      const res = await fetch(\`\${baseUrl}\${endpoint}\`);
      return res.json();
    },
    async post(endpoint: string, body: T): Promise<ApiResponse<T>> {
      const res = await fetch(\`\${baseUrl}\${endpoint}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return res.json();
    },
  };
}`,
  json: `{
  "name": "ntools",
  "version": "1.0.0",
  "description": "Daily UI Tools Factory",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint"
  },
  "dependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.2"
  }
}`,
  css: `/* Example: Modern CSS with custom properties */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --radius: 0.5rem;
  --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.card {
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

@media (max-width: 640px) {
  .card { padding: 1rem; }
}`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ntools - Daily UI Tools</title>
</head>
<body>
  <header>
    <h1>Welcome to ntools</h1>
    <nav>
      <a href="/tools">All Tools</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main>
    <section class="tools-grid">
      <!-- Tools will be loaded here -->
    </section>
  </main>
</body>
</html>`,
  markdown: `# ntools Documentation

## Overview
ntools is a **daily UI tools factory** that builds 24 tools per day.

## Features
- 42+ tools and growing
- React + TypeScript + Vite
- Automatic daily builds via cron

## Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\``,
  yaml: `# Example: Docker Compose
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: ntools
      POSTGRES_PASSWORD: secret
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <app name="ntools" version="1.0.0">
    <settings>
      <setting key="theme" value="auto"/>
      <setting key="language" value="en"/>
    </settings>
    <tools>
      <tool name="json-formatter" enabled="true"/>
      <tool name="code-formatter" enabled="true"/>
    </tools>
  </app>
</configuration>`,
  sql: `-- Example: PostgreSQL query with CTE
WITH user_stats AS (
  SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(p.id) as post_count,
    MAX(p.created_at) as last_post
  FROM users u
  LEFT JOIN posts p ON p.user_id = u.id
  WHERE u.created_at > '2024-01-01'
  GROUP BY u.id, u.name, u.email
)
SELECT * FROM user_stats
WHERE post_count > 5
ORDER BY last_post DESC
LIMIT 20;`,
  python: `# Example: Python async function
import asyncio
import aiohttp
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class User:
    id: str
    name: str
    email: str

async def fetch_users(session: aiohttp.ClientSession, ids: List[str]) -> List[User]:
    tasks = [fetch_user(session, uid) for uid in ids]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return [r for r in results if isinstance(r, User)]

async def fetch_user(session: aiohttp.ClientSession, user_id: str) -> User:
    async with session.get(f"/api/users/{user_id}") as resp:
        data = await resp.json()
        return User(**data)`,
};

const INDENT_SIZES = [2, 4, 8] as const;
type IndentSize = (typeof INDENT_SIZES)[number];

function formatCode(code: string, language: Language, mode: FormatMode, indentSize: IndentSize): FormatResult {
  const inputLines = code.split('\n').length;
  const inputChars = code.length;
  
  let output: string;
  let error: string | undefined;
  
  try {
    if (mode === 'minify') {
      output = minifyCode(code, language);
    } else {
      output = beautifyCode(code, language, indentSize);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Formatting failed';
    output = '';
  }
  
  const outputLines = output.split('\n').length;
  const outputChars = output.length;
  
  return { code: output, error, stats: { inputLines, outputLines, inputChars, outputChars } };
}

function beautifyCode(code: string, language: Language, indentSize: IndentSize): string {
  const indent = ' '.repeat(indentSize);
  
  switch (language) {
    case 'json':
      return JSON.stringify(JSON.parse(code), null, indentSize);
    
    case 'javascript':
    case 'typescript':
      return beautifyJS(code, indent);
    
    case 'css':
      return beautifyCSS(code, indent);
    
    case 'html':
      return beautifyHTML(code, indent);
    
    case 'markdown':
      return beautifyMarkdown(code);
    
    case 'yaml':
      return beautifyYAML(code, indentSize);
    
    case 'xml':
      return beautifyXML(code, indent);
    
    case 'sql':
      return beautifySQL(code, indent);
    
    case 'python':
      return beautifyPython(code, indent);
    
    default:
      return code;
  }
}

function minifyCode(code: string, language: Language): string {
  switch (language) {
    case 'json':
      return JSON.stringify(JSON.parse(code));
    
    case 'javascript':
    case 'typescript':
      return minifyJS(code);
    
    case 'css':
      return minifyCSS(code);
    
    case 'html':
      return minifyHTML(code);
    
    case 'xml':
      return minifyXML(code);
    
    default:
      return code.replace(/\s+/g, ' ').trim();
  }
}

function beautifyJS(code: string, indent: string): string {
  let result = '';
  let indentLevel = 0;
  let inString = false;
  let stringChar = '';
  let inTemplate = false;
  let inRegex = false;
  let prevChar = '';
  let i = 0;
  
  const addIndent = () => indent.repeat(Math.max(0, indentLevel));
  
  while (i < code.length) {
    const char = code[i];
    const nextChar = code[i + 1];
    
    // Handle string/template/regex states
    if (!inString && !inTemplate && !inRegex) {
      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
      } else if (char === '`') {
        inTemplate = true;
      } else if (char === '/' && nextChar !== '/' && nextChar !== '*') {
        // Potential regex - check context
        const before = result.trimEnd();
        const lastMeaningful = before[before.length - 1];
        if (!lastMeaningful || '(,=:[{;?|&!'.includes(lastMeaningful)) {
          inRegex = true;
        }
      }
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
    } else if (inTemplate && char === '`' && prevChar !== '\\') {
      inTemplate = false;
    } else if (inRegex && char === '/' && prevChar !== '\\') {
      inRegex = false;
    }
    
    if (!inString && !inTemplate && !inRegex) {
      // Handle brackets for indentation
      if (char === '{') {
        result += char + '\n' + addIndent();
        indentLevel++;
        i++;
        continue;
      }
      if (char === '}') {
        indentLevel = Math.max(0, indentLevel - 1);
        result = result.trimEnd() + '\n' + addIndent() + char;
        i++;
        continue;
      }
      if (char === '(' || char === '[') {
        result += char;
        i++;
        continue;
      }
      if (char === ')' || char === ']') {
        result += char;
        i++;
        continue;
      }
      
      // Handle semicolons and commas
      if (char === ';') {
        result += char + '\n' + addIndent();
        i++;
        continue;
      }
      if (char === ',') {
        result += char + ' ';
        i++;
        continue;
      }
      
      // Handle line breaks
      if (char === '\n') {
        result += '\n' + addIndent();
        i++;
        continue;
      }
    }
    
    result += char;
    prevChar = char;
    i++;
  }
  
  return result.trim() + '\n';
}

function minifyJS(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, '') // Remove line comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\s*([{}()[\];,=<>+*/%&|!^~?:])\s*/g, '$1') // Remove space around operators
    .replace(/;\s*}/g, '}') // Remove semicolon before }
    .trim();
}

function beautifyCSS(code: string, indent: string): string {
  let result = '';
  let indentLevel = 0;
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let i = 0;
  
  const addIndent = () => indent.repeat(indentLevel);
  
  while (i < code.length) {
    const char = code[i];
    const nextChar = code[i + 1];
    
    if (!inString && !inComment) {
      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
      } else if (char === '/' && nextChar === '*') {
        inComment = true;
      }
    } else if (inString && char === stringChar && code[i-1] !== '\\') {
      inString = false;
    } else if (inComment && char === '*' && nextChar === '/') {
      inComment = false;
      i++;
    }
    
    if (!inString && !inComment) {
      if (char === '{') {
        result = result.trimEnd() + ' {\n' + addIndent();
        indentLevel++;
        i++;
        continue;
      }
      if (char === '}') {
        indentLevel = Math.max(0, indentLevel - 1);
        result = result.trimEnd() + '\n' + addIndent() + '}';
        if (i + 1 < code.length && code[i + 1] !== '}') {
          result += '\n' + addIndent();
        }
        i++;
        continue;
      }
      if (char === ';') {
        result += ';\n' + addIndent();
        i++;
        continue;
      }
      if (char === '\n') {
        result += '\n' + addIndent();
        i++;
        continue;
      }
    }
    
    result += char;
    i++;
  }
  
  return result.trim() + '\n';
}

function minifyCSS(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,:])\s*/g, '$1')
    .replace(/;\s*}/g, '}')
    .trim();
}

function beautifyHTML(code: string, indent: string): string {
  // Simple HTML beautifier
  let result = '';
  let indentLevel = 0;
  let i = 0;
  const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  
  const addIndent = () => indent.repeat(indentLevel);
  
  while (i < code.length) {
    if (code[i] === '<') {
      const tagEnd = code.indexOf('>', i);
      if (tagEnd === -1) break;
      const tag = code.substring(i, tagEnd + 1);
      
      const isClosing = tag.startsWith('</');
      const isSelfClosing = tag.endsWith('/>') || voidElements.some(v => tag.match(new RegExp(`<${v}\\b`)));
      
      if (isClosing) {
        indentLevel = Math.max(0, indentLevel - 1);
        result += '\n' + addIndent() + tag;
      } else {
        if (result && !result.endsWith('\n' + addIndent())) {
          result += '\n' + addIndent();
        }
        result += tag;
        if (!isSelfClosing && !isClosing) {
          indentLevel++;
        }
      }
      
      i = tagEnd + 1;
    } else if (code[i] === '\n') {
      result += '\n' + addIndent();
      i++;
    } else {
      result += code[i];
      i++;
    }
  }
  
  return result.trim() + '\n';
}

function minifyHTML(code: string): string {
  return code
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

function beautifyMarkdown(code: string): string {
  // Simple markdown normalization
  return code
    .replace(/^#{1,6}\s*/gm, (match) => match.trim() + ' ')
    .replace(/\*\*\s*(.*?)\s*\*\*/g, '**$1**')
    .replace(/\*\s*(.*?)\s*\*/g, '*$1*')
    .replace(/`\s*(.*?)\s*`/g, '`$1`')
    .trim() + '\n';
}

function beautifyYAML(code: string, indentSize: number): string {
  // Simple YAML - just normalize indentation
  const lines = code.split('\n');
  let result = '';
  let expectedIndent = 0;
  
  for (const line of lines) {
    const trimmed = line.trimStart();
    if (!trimmed || trimmed.startsWith('#')) {
      result += line + '\n';
      continue;
    }
    
    const currentIndent = line.length - trimmed.length;
    if (currentIndent < expectedIndent) {
      expectedIndent = Math.max(0, currentIndent - indentSize);
    }
    
    result += ' '.repeat(expectedIndent) + trimmed + '\n';
    
    if (trimmed.endsWith(':')) {
      expectedIndent += indentSize;
    }
  }
  
  return result;
}

function beautifyXML(code: string, indent: string): string {
  // Similar to HTML but stricter
  return beautifyHTML(code, indent);
}

function minifyXML(code: string): string {
  return code
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

function beautifySQL(code: string, indent: string): string {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'WITH', 'AS', 'AND', 'OR', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'INDEX', 'VALUES', 'SET', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'];
  
  let result = code.toUpperCase(); // Normalize to uppercase for keyword detection
  
  for (const kw of keywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'g');
    result = result.replace(regex, `\n${indent}${kw}`);
  }
  
  return result
    .replace(/,\s*/g, ',\n' + indent)
    .replace(/\(\s*/g, '(\n' + indent + indent)
    .replace(/\s*\)/g, '\n' + indent + ')')
    .replace(/\n\s*\n/g, '\n')
    .trim() + '\n';
}

function beautifyPython(code: string, indent: string): string {
  // Python uses significant whitespace - just normalize
  const lines = code.split('\n');
  let result = '';
  let baseIndent = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    
    if (!trimmed || trimmed.startsWith('#')) {
      result += line + '\n';
      continue;
    }
    
    const currentIndent = line.length - trimmed.length;
    if (i === 0) baseIndent = currentIndent;
    
    const relativeIndent = currentIndent - baseIndent;
    const indentLevel = Math.max(0, Math.round(relativeIndent / 4));
    
    result += indent.repeat(indentLevel) + trimmed + '\n';
  }
  
  return result;
}

function detectLanguage(code: string): Language {
  const trimmed = code.trimStart();
  
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<') && !trimmed.startsWith('<!DOCTYPE') && !trimmed.startsWith('<html')) return 'xml';
  if (trimmed.startsWith('<!DOCTYPE html') || trimmed.startsWith('<html')) return 'html';
  if (trimmed.match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|WITH)\b/i)) return 'sql';
  if (trimmed.match(/^(def|class|import|from|async|await|with|if|for|while|try|except|finally)\b/)) return 'python';
  if (trimmed.includes(':') && trimmed.includes('---') && !trimmed.includes('{') && !trimmed.includes('[')) return 'yaml';
  if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.match(/^```/m)) return 'markdown';
  if (trimmed.match(/^(const|let|var|function|class|import|export|async|await|=>)\b/)) return 'javascript';
  if (trimmed.match(/^(interface|type|enum|const|let|var|function|class|import|export)\b/) || trimmed.includes(':') && trimmed.includes('=>')) return 'typescript';
  if (trimmed.match(/^[.#]?[\w-]+\s*{/m) || trimmed.includes('{') && trimmed.includes('}') && trimmed.includes(':')) return 'css';
  
  return 'javascript';
}

export default function CodeFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState<Language>('javascript');
  const [mode, setMode] = useState<FormatMode>('beautify');
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const [stats, setStats] = useState<FormatResult['stats']>({ inputLines: 0, outputLines: 0, inputChars: 0, outputChars: 0 });

  const format = useCallback(() => {
    setError(null);
    const result = formatCode(input, language, mode, indentSize);
    setOutput(result.code);
    setStats(result.stats);
    if (result.error) setError(result.error);
  }, [input, language, mode, indentSize]);

  useEffect(() => {
    if (autoDetect && input) {
      setLanguage(detectLanguage(input));
    }
  }, [input, autoDetect]);

  useEffect(() => {
    format();
  }, [format]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const loadExample = () => {
    setInput(EXAMPLES[language]);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    const ext = LANGUAGE_OPTIONS.find(l => l.value === language)?.extensions[0] || '.txt';
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
    setStats({ inputLines: 0, outputLines: 0, inputChars: 0, outputChars: 0 });
  };

  const swapMode = () => {
    setMode(prev => prev === 'beautify' ? 'minify' : 'beautify');
    setInput(output);
    setError(null);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Code Formatter</h2>
        <p className="tool-desc">Beautify or minify JavaScript, TypeScript, JSON, CSS, HTML, Markdown, YAML, XML, SQL, Python with configurable indentation</p>
      </div>

      <div className="formatter-toolbar">
        <div className="toolbar-group">
          <label className="tool-select">
            Language
            <select value={language} onChange={e => { setLanguage(e.target.value as Language); setAutoDetect(false); }}>
              {LANGUAGE_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </label>
          <label className="tool-checkbox">
            <input type="checkbox" checked={autoDetect} onChange={e => setAutoDetect(e.target.checked)} />
            Auto-detect
          </label>
        </div>

        <div className="toolbar-group">
          <label>
            <input
              type="radio"
              name="mode"
              value="beautify"
              checked={mode === 'beautify'}
              onChange={() => setMode('beautify')}
            />
            Beautify
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="minify"
              checked={mode === 'minify'}
              onChange={() => setMode('minify')}
            />
            Minify
          </label>
        </div>

        <div className="toolbar-group">
          <label className="tool-select">
            Indent
            <select value={indentSize} onChange={e => setIndentSize(parseInt(e.target.value) as IndentSize)}>
              {INDENT_SIZES.map(s => <option key={s} value={s}>{s} spaces</option>)}
            </select>
          </label>
        </div>

        <div className="toolbar-group actions">
          <button onClick={loadExample} className="btn-secondary">Load Example</button>
          <button onClick={clearAll} className="btn-secondary">Clear</button>
          <button onClick={copyOutput} className={copied ? 'copied' : 'btn-secondary'}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
          <button onClick={downloadOutput} className="btn-secondary">Download</button>
          <button onClick={swapMode} className="btn-secondary swap-btn" title="Swap input/output">
            ⇅ Swap
          </button>
        </div>
      </div>

      {error && <div className="error-banner">✗ {error}</div>}

      <div className="formatter-layout">
        <div className="editor-pane">
          <div className="pane-header">
            <h3>Input</h3>
            <div className="pane-stats">
              <span>{stats.inputLines} lines · {stats.inputChars} chars</span>
            </div>
          </div>
          <textarea
            className="code-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste code here..."
            spellCheck={false}
          />
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <h3>Output ({mode})</h3>
            <div className="pane-stats">
              <span>{stats.outputLines} lines · {stats.outputChars} chars</span>
            </div>
          </div>
          <textarea
            className="code-editor output"
            value={output}
            readOnly
            spellCheck={false}
          />
        </div>
      </div>

      <div className="formatter-info">
        <details>
          <summary>Supported Languages & Features</summary>
          <div className="info-grid">
            <div>
              <h4>Beautify</h4>
              <ul>
                <li>JavaScript / TypeScript - bracket/paren alignment, semicolon handling</li>
                <li>JSON - standard 2/4/8 space indentation</li>
                <li>CSS - rule/selector formatting, media query nesting</li>
                <li>HTML/XML - tag nesting, void element handling</li>
                <li>Markdown - header spacing, emphasis normalization</li>
                <li>YAML - indent normalization for nested structures</li>
                <li>SQL - keyword capitalization, clause alignment</li>
                <li>Python - significant whitespace preservation</li>
              </ul>
            </div>
            <div>
              <h4>Minify</h4>
              <ul>
                <li>Removes comments and unnecessary whitespace</li>
                <li>Collapses multiple spaces to single space</li>
                <li>Removes semicolons before closing braces</li>
                <li>Preserves string/template literal content</li>
              </ul>
              <h4>Keyboard Shortcuts</h4>
              <ul>
                <li><kbd>Ctrl/Cmd + Enter</kbd> - Format</li>
                <li><kbd>Ctrl/Cmd + Shift + C</kbd> - Copy output</li>
                <li><kbd>Ctrl/Cmd + L</kbd> - Load example</li>
              </ul>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}