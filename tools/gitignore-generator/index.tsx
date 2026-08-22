import { useState, useMemo } from 'react';

interface GitignoreTemplate {
  name: string;
  description: string;
  content: string;
  category: string;
}

const GITIGNORE_TEMPLATES: GitignoreTemplate[] = [
  // Languages
  { name: 'Node', description: 'Node.js / npm / yarn', category: 'Languages', content: `# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
dist/
build/
.next/
out/
coverage/
.nyc_output/
*.log
*.tsbuildinfo
` },
  { name: 'Python', description: 'Python / pip / poetry', category: 'Languages', content: `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/
dist/
build/
*.egg-info/
.pytest_cache/
.coverage
htmlcov/
.tox/
.mypy_cache/
.dmypy.json
pyright/
.ruff_cache/
.idea/
.vscode/
*.swp
*.swo
` },
  { name: 'Go', description: 'Go modules', category: 'Languages', content: `# Go
vendor/
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
go.work
` },
  { name: 'Rust', description: 'Rust / Cargo', category: 'Languages', content: `# Rust
/target/
**/*.rs.bk
Cargo.lock
` },
  { name: 'Java', description: 'Java / Maven / Gradle', category: 'Languages', content: `# Java
*.class
*.jar
*.war
*.ear
*.nar
hs_err_pid*
target/
.gradle/
build/
.mvn/
*.log
` },
  { name: 'C/C++', description: 'C / C++ builds', category: 'Languages', content: `# C/C++
*.o
*.ko
*.obj
*.elf
*.dll
*.so
*.dylib
*.a
*.lib
*.exe
*.out
*.app
*.i*86
*.x86_64
*.deb
*.rpm
build/
cmake-build-*/
` },
  { name: 'TypeScript', description: 'TypeScript builds', category: 'Languages', content: `# TypeScript
*.tsbuildinfo
dist/
build/
*.js
*.js.map
*.d.ts
!*.d.ts
` },

  // Frameworks
  { name: 'React', description: 'React / Create React App / Vite', category: 'Frameworks', content: `# React
node_modules/
build/
dist/
.env.local
.env.development.local
.env.test.local
.env.production.local
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.DS_Store
*.local
` },
  { name: 'Next.js', description: 'Next.js framework', category: 'Frameworks', content: `# Next.js
node_modules/
.next/
out/
build/
dist/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
vercel
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.DS_Store
*.tsbuildinfo
next-env.d.ts
` },
  { name: 'Vue', description: 'Vue.js / Vite', category: 'Frameworks', content: `# Vue
node_modules/
dist/
dist-ssr/
*.local
.env
.env.*
!.env.example
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.DS_Store
` },
  { name: 'Svelte', description: 'Svelte / SvelteKit', category: 'Frameworks', content: `# Svelte
node_modules/
build/
.svelte-kit/
package
.DS_Store
*.log
*.tsbuildinfo
.env
.env.*
!.env.example
` },
  { name: 'Django', description: 'Django framework', category: 'Frameworks', content: `# Django
*.log
*.pot
*.pyc
__pycache__/
db.sqlite3
db.sqlite3-journal
media/
staticfiles/
.env
.venv
venv/
*.mo
static/admin/
` },
  { name: 'Flask', description: 'Flask framework', category: 'Frameworks', content: `# Flask
instance/
.webassets-cache
*.pyc
__pycache__/
*.log
.env
.venv
venv/
` },
  { name: 'Laravel', description: 'Laravel framework', category: 'Frameworks', content: `# Laravel
vendor/
.env
.env.backup
.phpunit.result.cache
Homestead.json
Homestead.yaml
npm-debug.log
yarn-error.log
storage/*.key
public/hot
public/storage
*.log
` },

  // IDEs
  { name: 'VS Code', description: 'Visual Studio Code', category: 'IDEs', content: `# VS Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
*.code-workspace
` },
  { name: 'IntelliJ', description: 'IntelliJ IDEA / WebStorm / PyCharm', category: 'IDEs', content: `# IntelliJ
.idea/
*.iml
*.ipr
*.iws
out/
` },
  { name: 'Vim/Neovim', description: 'Vim and Neovim', category: 'IDEs', content: `# Vim/Neovim
[._]*.s[a-w][a-z]
[._]s[a-w][a-z]
*.un~
Session.vim
.netrwhist
*~
` },

  // OS
  { name: 'macOS', description: 'macOS system files', category: 'OS', content: `# macOS
.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
VolumeIcon.icns
.com.apple.timemachine.donotpresent
.AppleDB
.AppleDesktop
Network Trash Folder
Temporary Items
.apdisk
` },
  { name: 'Windows', description: 'Windows system files', category: 'OS', content: `# Windows
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/
*.cab
*.msi
*.msm
*.msp
*.lnk
` },
  { name: 'Linux', description: 'Linux system files', category: 'OS', content: `# Linux
*~
.fuse_hidden*
.directory
.Trash-*
.nfs*
` },

  // Package Managers
  { name: 'npm', description: 'npm package manager', category: 'Package Managers', content: `# npm
node_modules/
package-lock.json
npm-debug.log*
.yarn-integrity
` },
  { name: 'yarn', description: 'Yarn package manager', category: 'Package Managers', content: `# Yarn
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
pnp.*
` },
  { name: 'pnpm', description: 'pnpm package manager', category: 'Package Managers', content: `# pnpm
pnpm-lock.yaml
` },
  { name: 'composer', description: 'PHP Composer', category: 'Package Managers', content: `# Composer
vendor/
composer.lock
` },

  // Build Tools
  { name: 'Vite', description: 'Vite build tool', category: 'Build Tools', content: `# Vite
dist/
dist-ssr/
*.local
` },
  { name: 'Webpack', description: 'Webpack build tool', category: 'Build Tools', content: `# Webpack
dist/
build/
*.bundle.js
*.bundle.js.map
` },
  { name: 'Docker', description: 'Docker', category: 'Build Tools', content: `# Docker
.dockerignore
docker-compose.override.yml
` },

  // Testing
  { name: 'Jest', description: 'Jest testing', category: 'Testing', content: `# Jest
coverage/
` },
  { name: 'Cypress', description: 'Cypress testing', category: 'Testing', content: `# Cypress
cypress/videos/
cypress/screenshots/
cypress/downloads/
` },
  { name: 'Playwright', description: 'Playwright testing', category: 'Testing', content: `# Playwright
test-results/
playwright-report/
` },

  // Misc
  { name: 'Terraform', description: 'Terraform', category: 'Misc', content: `# Terraform
*.tfstate
*.tfstate.*
*.tfvars
*.tfvars.json
.terraform/
.terraform.lock.hcl
` },
  { name: 'Kubernetes', description: 'Kubernetes', category: 'Misc', content: `# Kubernetes
*.kubeconfig
kubeconfig
` },
];

const CATEGORIES = ['All', ...new Set(GITIGNORE_TEMPLATES.map(t => t.category))];

export default function GitignoreGenerator() {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(['Node', 'macOS', 'Windows', 'Linux', 'VS Code']);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredTemplates = useMemo(() =>
    GITIGNORE_TEMPLATES.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
      return matchesSearch && matchesCategory;
    }), [searchQuery, filterCategory]
  );

  const groupedTemplates = useMemo(() => {
    const groups: Record<string, GitignoreTemplate[]> = {};
    filteredTemplates.forEach(t => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [filteredTemplates]);

  const generateGitignore = () => {
    const parts = selectedTemplates.map(name => {
      const template = GITIGNORE_TEMPLATES.find(t => t.name === name);
      return template ? `# ${template.name} (${template.description})\n${template.content}` : '';
    }).filter(Boolean);

    const header = `# Generated by ntools Gitignore Generator
# https://github.com/M-Destiny/ntools

`;

    const result = header + parts.join('\n\n') + '\n';
    setOutput(result);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.gitignore';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleTemplate = (name: string) => {
    setSelectedTemplates(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const selectAll = () => setSelectedTemplates(GITIGNORE_TEMPLATES.map(t => t.name));
  const clearAll = () => setSelectedTemplates([]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Gitignore Generator</h2>
        <p className="tool-desc">Generate .gitignore files by selecting from 30+ templates for languages, frameworks, IDEs, and OS.</p>
      </div>

      <div className="tool-grid">
        {/* Left Panel - Template Selection */}
        <div className="picker-panel">
          <div className="controls-bar">
            <div className="search-box">
              <input
                type="search"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Search templates"
              />
              <span className="search-icon" aria-hidden="true">🔍</span>
            </div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="category-select"
              aria-label="Filter by category"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          <div className="template-list">
            {Object.entries(groupedTemplates).map(([category, templates]) => (
              <div key={category} className="template-category">
                <h4 className="category-title">{category}</h4>
                <div className="template-grid">
                  {templates.map(template => (
                    <label key={template.name} className={`template-card ${selectedTemplates.includes(template.name) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(template.name)}
                        onChange={() => toggleTemplate(template.name)}
                        className="template-checkbox"
                      />
                      <div className="template-info">
                        <span className="template-name">{template.name}</span>
                        <span className="template-desc">{template.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="selection-actions">
            <button onClick={selectAll} className="btn btn-secondary" disabled={selectedTemplates.length === GITIGNORE_TEMPLATES.length}>
              Select All
            </button>
            <button onClick={clearAll} className="btn btn-secondary" disabled={selectedTemplates.length === 0}>
              Clear All
            </button>
            <span className="selection-count">{selectedTemplates.length} selected</span>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="canvas-panel">
          <div className="output-header">
            <h3>Generated .gitignore</h3>
            <div className="output-actions">
              <button onClick={generateGitignore} className="btn btn-primary">
                Generate
              </button>
              <button onClick={copyToClipboard} className="btn btn-secondary" disabled={!output}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <button onClick={downloadFile} className="btn btn-secondary" disabled={!output}>
                Download
              </button>
            </div>
          </div>

          <div className="output-area">
            {output ? (
              <pre className="output-content"><code>{output}</code></pre>
            ) : (
              <div className="output-placeholder">
                <p>Select templates and click "Generate" to create your .gitignore file.</p>
                <p className="placeholder-hint">Popular defaults: Node, macOS, Windows, Linux, VS Code</p>
              </div>
            )}
          </div>

          {output && (
            <div className="output-stats">
              <span>{output.split('\n').length} lines</span>
              <span>{new Blob([output]).size} bytes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}