import { useState, useMemo } from 'react';

export default function TokenCounter() {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'llama-3' | 'custom'>('gpt-4');
  const [customTokenizer, setCustomTokenizer] = useState('');

  // Simple tokenization approximations for different models
  const tokenize = (text: string, modelType: string): number => {
    if (!text) return 0;
    
    switch (modelType) {
      case 'gpt-4':
      case 'gpt-3.5-turbo':
        // GPT-4/3.5: ~1 token per 4 characters, but more accurately using tiktoken-like estimation
        // Rough approximation: words * 1.3 + punctuation
        return Math.ceil(text.length / 3.5);
      case 'claude-3':
        // Claude: similar to GPT but slightly different
        return Math.ceil(text.length / 3.8);
      case 'llama-3':
        // Llama 3: uses byte-pair encoding, roughly 1 token per 3.5-4 chars
        return Math.ceil(text.length / 3.5);
      case 'custom':
        // Custom: simple word count * 1.3
        if (!customTokenizer) return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3);
        try {
          // If custom tokenizer is a regex, use it
          const regex = new RegExp(customTokenizer, 'g');
          const matches = text.match(regex);
          return matches ? matches.length : 0;
        } catch {
          return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3);
        }
      default:
        return Math.ceil(text.length / 4);
    }
  };

  const countWords = (text: string): number => {
    return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  };

  const countChars = (text: string): number => text.length;
  const countCharsNoSpace = (text: string): number => text.replace(/\s/g, '').length;
  const countLines = (text: string): number => text.split('\n').length;
  const countSentences = (text: string): number => text.split(/[.!?]+/).filter(s => s.trim()).length;
  const countParagraphs = (text: string): number => text.split(/\n\s*\n/).filter(p => p.trim()).length;

  const stats = useMemo(() => {
    const tokens = tokenize(input, model);
    return {
      tokens,
      words: countWords(input),
      chars: countChars(input),
      charsNoSpace: countCharsNoSpace(input),
      lines: countLines(input),
      sentences: countSentences(input),
      paragraphs: countParagraphs(input),
      // Cost estimation (rough, as of 2024)
      estimatedCost: {
        'gpt-4-input': (tokens / 1000) * 0.03,
        'gpt-4-output': (tokens / 1000) * 0.06,
        'gpt-3.5-input': (tokens / 1000) * 0.0005,
        'gpt-3.5-output': (tokens / 1000) * 0.0015,
        'claude-3-opus-input': (tokens / 1000) * 0.015,
        'claude-3-opus-output': (tokens / 1000) * 0.075,
        'claude-3-sonnet-input': (tokens / 1000) * 0.003,
        'claude-3-sonnet-output': (tokens / 1000) * 0.015,
      }
    };
  }, [input, model, customTokenizer]);

  const modelInfo = {
    'gpt-4': { name: 'GPT-4 / GPT-4o', context: 128000, tokenizer: 'cl100k_base' },
    'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', context: 16385, tokenizer: 'cl100k_base' },
    'claude-3': { name: 'Claude 3 (Opus/Sonnet/Haiku)', context: 200000, tokenizer: 'custom' },
    'llama-3': { name: 'Llama 3 / 3.1', context: 131072, tokenizer: 'custom BPE' },
    'custom': { name: 'Custom / Estimation', context: 'N/A', tokenizer: 'word-based' },
  };

  const commonTexts = [
    { name: 'Lorem Ipsum', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    { name: 'Code Sample', text: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}' },
    { name: 'JSON Example', text: '{"users": [{"id": 1, "name": "Alice", "email": "alice@example.com"}, {"id": 2, "name": "Bob", "email": "bob@example.com"}]}' },
    { name: 'Long Text', text: ' '.repeat(500).split(' ').map((_, i) => `Word${i}`).join(' ') },
  ];

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Token Counter</h2>
        <p className="tool-desc">Count tokens, words, characters, and estimate costs for various LLM models. Paste text or load examples.</p>
      </div>

      <div className="tool-grid">
        <div className="panel">
          <h3>Input Text</h3>
          <div className="input-toolbar mb-2 flex gap-2 flex-wrap">
            <select
              value={model}
              onChange={e => setModel(e.target.value as any)}
              className="px-3 py-2 border rounded bg-white dark:bg-gray-800"
            >
              {Object.entries(modelInfo).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
            {model === 'custom' && (
              <input
                type="text"
                value={customTokenizer}
                onChange={e => setCustomTokenizer(e.target.value)}
                placeholder="Custom regex (optional)"
                className="px-3 py-2 border rounded bg-white dark:bg-gray-800 flex-1 min-w-[200px]"
              />
            )}
            <button
              onClick={() => setInput('')}
              className="px-3 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste text here to count tokens..."
            className="token-input font-mono w-full"
            rows={12}
            spellCheck={false}
          />
          <div className="examples mt-2 flex flex-wrap gap-2">
            {commonTexts.map(ex => (
              <button
                key={ex.name}
                onClick={() => setInput(ex.text)}
                className="px-3 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Load {ex.name}
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Token Count: {stats.tokens.toLocaleString()}</h3>
          <div className="model-info mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="font-semibold">{modelInfo[model].name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Context window: {modelInfo[model].context.toLocaleString()} tokens | Tokenizer: {modelInfo[model].tokenizer}
            </div>
            {typeof modelInfo[model].context === 'number' && (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Usage: {((stats.tokens / modelInfo[model].context) * 100).toFixed(2)}% of context window
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (stats.tokens / modelInfo[model].context) * 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="stat-card p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
              <div className="text-2xl font-bold">{stats.tokens.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Tokens</div>
            </div>
            <div className="stat-card p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
              <div className="text-2xl font-bold">{stats.words.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Words</div>
            </div>
            <div className="stat-card p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
              <div className="text-2xl font-bold">{stats.chars.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Characters</div>
            </div>
            <div className="stat-card p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
              <div className="text-2xl font-bold">{stats.charsNoSpace.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Chars (no space)</div>
            </div>
            <div className="stat-card p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
              <div className="text-2xl font-bold">{stats.lines.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Lines</div>
            </div>
            <div className="stat-card p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
              <div className="text-2xl font-bold">{stats.sentences.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Sentences</div>
            </div>
            <div className="stat-card p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
              <div className="text-2xl font-bold">{stats.paragraphs.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Paragraphs</div>
            </div>
            <div className="stat-card p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
              <div className="text-2xl font-bold">{(stats.chars / Math.max(1, stats.words)).toFixed(1)}</div>
              <div className="text-xs text-gray-500">Avg chars/word</div>
            </div>
          </div>

          <div className="cost-estimation p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Estimated API Costs (USD)</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>GPT-4 Input:</strong> ${stats.estimatedCost['gpt-4-input'].toFixed(6)}</div>
              <div><strong>GPT-4 Output:</strong> ${stats.estimatedCost['gpt-4-output'].toFixed(6)}</div>
              <div><strong>GPT-3.5 Input:</strong> ${stats.estimatedCost['gpt-3.5-input'].toFixed(6)}</div>
              <div><strong>GPT-3.5 Output:</strong> ${stats.estimatedCost['gpt-3.5-output'].toFixed(6)}</div>
              <div><strong>Claude Opus Input:</strong> ${stats.estimatedCost['claude-3-opus-input'].toFixed(6)}</div>
              <div><strong>Claude Opus Output:</strong> ${stats.estimatedCost['claude-3-opus-output'].toFixed(6)}</div>
              <div><strong>Claude Sonnet Input:</strong> ${stats.estimatedCost['claude-3-sonnet-input'].toFixed(6)}</div>
              <div><strong>Claude Sonnet Output:</strong> ${stats.estimatedCost['claude-3-sonnet-output'].toFixed(6)}</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">* Estimates based on public pricing. Actual costs may vary.</p>
          </div>
        </div>
      </div>

      <div className="panel mt-4">
        <h3>Tokenization Comparison</h3>
        <p className="text-sm text-gray-500 mb-3">How different models would tokenize the same text (approximate)</p>
        <div className="comparison-table overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-600">
                <th className="text-left p-2">Model</th>
                <th className="text-right p-2">Est. Tokens</th>
                <th className="text-right p-2">Context Window</th>
                <th className="text-right p-2">% Used</th>
                <th className="text-left p-2">Tokenizer</th>
              </tr>
            </thead>
            <tbody>
                          {Object.entries(modelInfo).map(([key, info]) => {
                            const estTokens = tokenize(input, key);
                            return (
                              <tr key={key} className="border-b dark:border-gray-700">
                                <td className="p-2 font-mono">{info.name}</td>
                                <td className="p-2 text-right font-mono">{estTokens.toLocaleString()}</td>
                                <td className="p-2 text-right font-mono">{info.context.toLocaleString()}</td>
                                <td className="p-2 text-right font-mono">
                                  {typeof info.context === 'number'
                                    ? ((estTokens / info.context) * 100).toFixed(2) + '%'
                                    : 'N/A'
                                  }
                                </td>
                                <td className="p-2 font-mono">{info.tokenizer}</td>
                              </tr>
                            );
                          })}
                        </tbody>
          </table>
        </div>
      </div>

      <div className="panel mt-4">
        <h3>About Token Counting</h3>
        <div className="prose text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p><strong>What are tokens?</strong> Tokens are the basic units that LLMs process. They can be words, parts of words, or even single characters.</p>
          <p><strong>Why count tokens?</strong> LLMs have context limits (max tokens per request), and API pricing is typically per 1K tokens.</p>
          <p><strong>Estimation accuracy:</strong> This tool uses character-based approximations. For exact counts, use the official tokenizers (e.g., <code>tiktoken</code> for OpenAI models).</p>
          <p><strong>Rules of thumb:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>English: ~1 token ≈ 4 characters ≈ 0.75 words</li>
            <li>Code: ~1 token ≈ 3-4 characters (more symbols)</li>
            <li>Non-Latin scripts: More tokens per character</li>
          </ul>
        </div>
      </div>
    </div>
  );
}