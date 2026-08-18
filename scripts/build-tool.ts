#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const toolName = process.argv[2];
if (!toolName) {
  console.error('Usage: ts-node scripts/build-tool.ts <tool-name>');
  process.exit(1);
}

const toolDir = join(__dirname, '..', 'tools', toolName);
if (existsSync(toolDir)) {
  console.error(`Tool ${toolName} already exists`);
  process.exit(1);
}

mkdirSync(toolDir, { recursive: true });

// index.tsx boilerplate
const className = toolName.charAt(0).toUpperCase() + toolName.slice(1);
const indexTsx = `import React from 'react';

export default function ${className}() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">${toolName}</h1>
      <p className="text-gray-600">Tool implementation goes here</p>
    </div>
  );
}
`;
writeFileSync(join(toolDir, 'index.tsx'), indexTsx);

// README.md
const readme = `# ${toolName}

## Description
${toolName} - A useful UI tool built with React + TypeScript.

## Usage
\`\`\`tsx
import ${className} from './tools/${toolName}';
\`\`\`

## Features
- [ ] Feature 1
- [ ] Feature 2

## Development
\`\`\`bash
npm run dev
\`\`\`
`;
writeFileSync(join(toolDir, 'README.md'), readme);

console.log(`Created tool scaffold at tools/${toolName}/`);