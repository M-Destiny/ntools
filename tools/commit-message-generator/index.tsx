import { useState, useCallback } from 'react';

type CommitType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'chore' | 'build' | 'ci' | 'revert';

const COMMIT_TYPES: { id: CommitType; name: string; description: string; emoji: string }[] = [
  { id: 'feat', name: 'feat', description: 'A new feature', emoji: '✨' },
  { id: 'fix', name: 'fix', description: 'A bug fix', emoji: '🐛' },
  { id: 'docs', name: 'docs', description: 'Documentation only changes', emoji: '📚' },
  { id: 'style', name: 'style', description: 'Changes that do not affect the meaning of the code', emoji: '💄' },
  { id: 'refactor', name: 'refactor', description: 'A code change that neither fixes a bug nor adds a feature', emoji: '♻️' },
  { id: 'perf', name: 'perf', description: 'A code change that improves performance', emoji: '⚡' },
  { id: 'test', name: 'test', description: 'Adding missing tests or correcting existing tests', emoji: '✅' },
  { id: 'chore', name: 'chore', description: 'Changes to the build process or auxiliary tools', emoji: '🔧' },
  { id: 'build', name: 'build', description: 'Changes that affect the build system or external dependencies', emoji: '📦' },
  { id: 'ci', name: 'ci', description: 'Changes to our CI configuration files and scripts', emoji: '👷' },
  { id: 'revert', name: 'revert', description: 'Reverts a previous commit', emoji: '⏪' },
];

export default function CommitMessageGenerator() {
  const [type, setType] = useState<CommitType>('feat');
  const [scope, setScope] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [breakingChanges, setBreakingChanges] = useState('');
  const [footer, setFooter] = useState('');
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState('');

  const generateMessage = useCallback(() => {
    const selectedType = COMMIT_TYPES.find(t => t.id === type);
    const typePrefix = selectedType ? `${selectedType.emoji} ${type}` : type;
    
    let message = `${typePrefix}`;
    
    if (scope.trim()) {
      message += `(${scope.trim()})`;
    }
    
    message += `: ${description.trim()}`;
    
    if (body.trim()) {
      message += `\n\n${body.trim()}`;
    }
    
    if (breakingChanges.trim()) {
      message += `\n\nBREAKING CHANGE: ${breakingChanges.trim()}`;
    }
    
    if (footer.trim()) {
      message += `\n\n${footer.trim()}`;
    }
    
    setPreview(message);
  }, [type, scope, description, body, breakingChanges, footer]);

  const copyToClipboard = useCallback(async () => {
    if (preview) {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [preview]);

  const handleClear = useCallback(() => {
    setScope('');
    setDescription('');
    setBody('');
    setBreakingChanges('');
    setFooter('');
    setPreview('');
  }, []);

  const loadExample = useCallback(() => {
    setType('feat');
    setScope('auth');
    setDescription('add OAuth2 login with Google provider');
    setBody('Implements OAuth2 flow with Google as identity provider.\n\n- Adds GoogleStrategy to passport configuration\n- Creates /auth/google and /auth/google/callback routes\n- Stores refresh tokens securely in database\n- Adds user profile sync on first login');
    setBreakingChanges('');
    setFooter('Closes #123\nRelated: #456');
  }, []);

  const getSelectedType = COMMIT_TYPES.find(t => t.id === type);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Commit Message Generator</h2>
        <p className="tool-desc">Generate conventional commit messages following the Conventional Commits specification. Supports all standard types, scopes, breaking changes, and footers.</p>
      </div>

      <div className="commit-generator">
        <div className="input-section">
          <div className="type-selector">
            <label>Commit Type:</label>
            <div className="type-grid">
              {COMMIT_TYPES.map(t => (
                <button
                  key={t.id}
                  className={type === t.id ? 'active' : ''}
                  onClick={() => setType(t.id)}
                  title={t.description}
                >
                  <span className="emoji">{t.emoji}</span>
                  <span className="name">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label>Scope (optional):</label>
            <input
              type="text"
              value={scope}
              onChange={e => setScope(e.target.value)}
              placeholder="e.g., auth, api, ui, docs"
              maxLength={50}
            />
            <span className="hint">Component or module affected (e.g., auth, api, parser)</span>
          </div>

          <div className="form-field required">
            <label>Description <span className="required-mark">*</span>:</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., add user authentication endpoint"
              maxLength={100}
            />
            <span className="hint">Short summary in imperative mood, lowercase, no period (max 100 chars)</span>
          </div>

          <div className="form-field">
            <label>Body (optional):</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Longer description of the change. Explain what and why, not how."
              rows={4}
            />
            <span className="hint">Detailed explanation. Wrap at 72 characters per line.</span>
          </div>

          <div className="form-field">
            <label>Breaking Changes (optional):</label>
            <textarea
              value={breakingChanges}
              onChange={e => setBreakingChanges(e.target.value)}
              placeholder="Description of breaking changes and migration guide"
              rows={3}
            />
            <span className="hint">Adds BREAKING CHANGE: footer automatically</span>
          </div>

          <div className="form-field">
            <label>Footer (optional):</label>
            <textarea
              value={footer}
              onChange={e => setFooter(e.target.value)}
              placeholder="e.g., Closes #123\nRelated: #456\nCo-authored-by: Name <email>"
              rows={3}
            />
            <span className="hint">Issue references, co-authors, etc.</span>
          </div>

          <div className="button-group">
            <button className="primary-btn" onClick={generateMessage}>
              Generate Message
            </button>
            <button className="secondary-btn" onClick={loadExample}>
              Load Example
            </button>
            <button className="secondary-btn" onClick={handleClear}>
              Clear All
            </button>
          </div>
        </div>

        <div className="output-section">
          <div className="output-header">
            <h3>Generated Commit Message</h3>
            <button 
              className={copied ? 'copy-btn copied' : 'copy-btn'} 
              onClick={copyToClipboard}
              disabled={!preview}
            >
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          
          <div className="commit-preview">
            {preview ? (
              <pre className="commit-message"><code>{preview}</code></pre>
            ) : (
              <div className="placeholder">
                Fill in the fields and click "Generate Message" to preview
              </div>
            )}
          </div>

          {preview && (
            <div className="validation-section">
              <h4>Validation</h4>
              <div className="validation-checks">
                <div className={`check ${description.trim() ? 'pass' : 'fail'}`}>
                  <span className="check-icon">{description.trim() ? '✓' : '✗'}</span>
                  <span>Description provided</span>
                </div>
                <div className={`check ${description.length <= 100 ? 'pass' : 'fail'}`}>
                  <span className="check-icon">{description.length <= 100 ? '✓' : '✗'}</span>
                  <span>Description ≤ 100 chars ({description.length}/100)</span>
                </div>
                <div className={`check ${!description.endsWith('.') ? 'pass' : 'fail'}`}>
                  <span className="check-icon">{!description.endsWith('.') ? '✓' : '✗'}</span>
                  <span>No trailing period</span>
                </div>
                <div className={`check ${description === description.toLowerCase() ? 'pass' : 'fail'}`}>
                  <span className="check-icon">{description === description.toLowerCase() ? '✓' : '✗'}</span>
                  <span>Lowercase description</span>
                </div>
                <div className={`check ${type === 'revert' || description.match(/^(add|remove|fix|update|refactor|implement|create|delete|bump|migrate|revert)/i) ? 'pass' : 'warn'}`}>
                  <span className="check-icon">{type === 'revert' || description.match(/^(add|remove|fix|update|refactor|implement|create|delete|bump|migrate|revert)/i) ? '✓' : '?'}</span>
                  <span>Imperative mood</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="help-section">
        <details>
          <summary>Conventional Commits Guide</summary>
          <div className="help-content">
            <h4>Format</h4>
            <pre><code><type>[<scope>]: <description>

[<body>]

[<BREAKING CHANGE>]

[<footer>]</code></pre>

            <h4>Types</h4>
            <table>
              <thead>
                <tr><th>Type</th><th>Emoji</th><th>Description</th></tr>
              </thead>
              <tbody>
                {COMMIT_TYPES.map(t => (
                  <tr key={t.id}>
                    <td><code>{t.id}</code></td>
                    <td>{t.emoji}</td>
                    <td>{t.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Best Practices</h4>
            <ul>
              <li>Use imperative mood: "add" not "added" or "adds"</li>
              <li>Keep description under 100 characters</li>
              <li>Don't end description with a period</li>
              <li>Use lowercase for description</li>
              <li>Scope should be a noun: auth, api, ui, parser, etc.</li>
              <li>Body explains <strong>what</strong> and <strong>why</strong>, not <strong>how</strong></li>
              <li>Reference issues in footer: "Closes #123", "Fixes #456"</li>
              <li>Breaking changes MUST be in footer with "BREAKING CHANGE:" prefix</li>
            </ul>

            <h4>Examples</h4>
            <pre><code>feat(auth): add OAuth2 login with Google provider

Implements OAuth2 flow with Google as identity provider.

Closes #123</code></pre>
            <pre><code>fix(api): handle null response in user endpoint

Previously the endpoint would crash when user service
returned null. Now returns 404 with proper error message.

Fixes #456</code></pre>
            <pre><code>BREAKING CHANGE: remove deprecated v1 API endpoints

The v1 endpoints have been deprecated since v2.0.0.
Migration guide: https://example.com/migration

feat(api): add new v2 user endpoints</code></pre>
          </div>
        </details>
      </div>
    </div>
  );
}