import{n as e,r as t,t as n}from"./index-C2SRjNrK.js";var r=t(e(),1),i=n();function a(){let[e,t]=(0,r.useState)(`# Welcome to Markdown Preview

## Features

- **Real-time preview** — See changes instantly
- **Syntax highlighting** — Code blocks with language detection
- **Export options** — Copy HTML or download as file

### Code Example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

### Lists & Tables

| Feature | Status |
|---------|--------|
| Live preview | ✅ |
| GFM support | ✅ |
| Math rendering | 🚧 |

> **Tip:** Edit the markdown on the left to see live updates!

---

*Built with React + TypeScript*`),[n,a]=(0,r.useState)(``),[o,s]=(0,r.useState)(!1),[c,l]=(0,r.useState)(`github`),u=(0,r.useRef)(null);(0,r.useEffect)(()=>{try{let t=e.replace(/^### (.*$)/gim,`<h3>$1</h3>`).replace(/^## (.*$)/gim,`<h2>$1</h2>`).replace(/^# (.*$)/gim,`<h1>$1</h1>`).replace(/\*\*(.*?)\*\*/g,`<strong>$1</strong>`).replace(/\*(.*?)\*/g,`<em>$1</em>`).replace(/__(.*?)__/g,`<strong>$1</strong>`).replace(/_(.*?)_/g,`<em>$1</em>`).replace(/```(\w*)\n([\s\S]*?)```/g,(e,t,n)=>`<pre><code class="language-${t}">${d(n.trim())}</code></pre>`).replace(/`([^`]+)`/g,`<code>$1</code>`).replace(/^> (.*$)/gim,`<blockquote>$1</blockquote>`).replace(/^---$/gim,`<hr>`).replace(/\[([^\]]+)\]\(([^)]+)\)/g,`<a href="$2" target="_blank" rel="noopener">$1</a>`).replace(/!\[([^\]]*)\]\(([^)]+)\)/g,`<img src="$2" alt="$1" />`).replace(/^\|(.*)\|$/gim,e=>`<tr>`+e.split(`|`).slice(1,-1).map(e=>e.trim()).map(e=>`<td>${e}</td>`).join(``)+`</tr>`).replace(/^\- (.*$)/gim,`<li>$1</li>`).replace(/^\d+\. (.*$)/gim,`<li>$1</li>`).replace(/^(?!<[hubl\/\?])(.*?)$/gim,(e,t)=>t.trim()&&!t.startsWith(`<`)&&!t.startsWith(`|`)?`<p>`+t+`</p>`:e).replace(/\n/g,`<br>`);t=t.replace(/(<li>.*<\/li>\n*)+/g,e=>`<ul>`+e+`</ul>`),a(t)}catch{a(`<div class="error">Error rendering markdown</div>`)}},[e]);let d=e=>e.replace(/&/g,`&`).replace(/</g,`<`).replace(/>/g,`>`).replace(/"/g,`"`).replace(/'/g,`&#039;`);return(0,i.jsxs)(`div`,{className:`tool-container`,children:[(0,i.jsxs)(`div`,{className:`tool-header`,children:[(0,i.jsx)(`h2`,{children:`Markdown Preview`}),(0,i.jsx)(`p`,{className:`tool-desc`,children:`Write markdown on the left, see live HTML preview on the right. Export as HTML file.`})]}),(0,i.jsxs)(`div`,{className:`markdown-layout`,children:[(0,i.jsxs)(`div`,{className:`editor-panel`,children:[(0,i.jsxs)(`div`,{className:`editor-toolbar`,children:[(0,i.jsx)(`h3`,{children:`Markdown Input`}),(0,i.jsxs)(`div`,{className:`toolbar-actions`,children:[(0,i.jsx)(`button`,{onClick:()=>{t(`# Markdown Preview Example

## Features

- **Real-time preview** — See changes instantly
- **Syntax highlighting** — Code blocks with language detection
- **Export options** — Copy HTML or download as file

### Code Example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

### Lists & Tables

| Feature | Status |
|---------|--------|
| Live preview | ✅ |
| GFM support | ✅ |
| Math rendering | 🚧 |

> **Tip:** Edit the markdown on the left to see live updates!

---

*Built with React + TypeScript*`)},className:`btn-secondary`,children:`Load Example`}),(0,i.jsx)(`button`,{onClick:()=>{t(``)},className:`btn-secondary`,children:`Clear`})]})]}),(0,i.jsx)(`textarea`,{className:`markdown-editor`,value:e,onChange:e=>t(e.target.value),placeholder:`Write markdown here...`,spellCheck:!1})]}),(0,i.jsxs)(`div`,{className:`preview-panel`,children:[(0,i.jsxs)(`div`,{className:`preview-toolbar`,children:[(0,i.jsx)(`h3`,{children:`Live Preview`}),(0,i.jsxs)(`div`,{className:`preview-actions`,children:[(0,i.jsxs)(`select`,{value:c,onChange:e=>l(e.target.value),className:`theme-select`,children:[(0,i.jsx)(`option`,{value:`github`,children:`GitHub`}),(0,i.jsx)(`option`,{value:`light`,children:`Light`}),(0,i.jsx)(`option`,{value:`dark`,children:`Dark`})]}),(0,i.jsx)(`button`,{onClick:()=>{navigator.clipboard.writeText(n),s(!0),setTimeout(()=>s(!1),2e3)},className:o?`copied`:``,children:o?`✓ Copied!`:`Copy HTML`}),(0,i.jsx)(`button`,{onClick:()=>{let e=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; font-family: 'Monaco', 'Menlo', monospace; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; color: inherit; }
    blockquote { border-left: 4px solid #3b82f6; margin: 1rem 0; padding-left: 1rem; color: #666; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    th { background: #f5f5f5; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${n}
</body></html>`,t=new Blob([e],{type:`text/html`}),r=URL.createObjectURL(t),i=document.createElement(`a`);i.href=r,i.download=`markdown-preview.html`,i.click(),URL.revokeObjectURL(r)},className:`btn-secondary`,children:`Download .html`})]})]}),(0,i.jsx)(`div`,{ref:u,className:`markdown-preview ${c}`,dangerouslySetInnerHTML:{__html:n}})]})]})]})}export{a as default};