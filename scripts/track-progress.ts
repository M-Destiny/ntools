#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Progress {
  date: string;
  daily_target: number;
  tools_built_today: number;
  total_tools: number;
  log: LogEntry[];
}

interface LogEntry {
  tool: string;
  timestamp: string;
  commit: string;
  status: 'built' | 'corrected' | 'triggered';
}

const progressPath = join(__dirname, '..', 'progress.json');
const progress: Progress = JSON.parse(readFileSync(progressPath, 'utf-8'));

const today = new Date().toISOString().split('T')[0];

// Reset if new day
if (progress.date !== today) {
  progress.date = today;
  progress.tools_built_today = 0;
  console.log('New day detected, reset tools_built_today to 0');
}

// Get today's commits from git
try {
  const gitLog = execSync('git log --since="00:00" --pretty=format:"%H %s"', { encoding: 'utf-8' });
  const commits = gitLog.trim().split('\n').filter(Boolean);
  const toolCommits = commits.filter(c => c.includes('feat(tools): add'));
  
  // Parse tool names from commit messages and deduplicate
  const allTools = new Set<string>();
  for (const commit of toolCommits) {
    const msg = commit.split(' ').slice(1).join(' '); // Remove hash, keep message
    const match = msg.match(/feat\(tools\): add (.+?)(?: to registry|$)/);
    if (match) {
      const toolStr = match[1];
      // Split by comma or " and " and trim
      const tools = toolStr.split(/,| and /).map((t: string) => t.trim()).filter((t: string) => t.length > 0);
      for (const tool of tools) {
        allTools.add(tool);
      }
    }
  }
  const toolsBuiltToday = allTools.size;
  
  console.log(`Today's tool commits: ${toolCommits.length}`);
  console.log(`Unique tools built today: ${toolsBuiltToday}`);
  console.log(`Progress claims: ${progress.tools_built_today}`);
  
  if (toolsBuiltToday !== progress.tools_built_today) {
    console.log('MISMATCH DETECTED - correcting progress.json');
    progress.tools_built_today = toolsBuiltToday;
    progress.log.push({
      tool: 'auto-correction',
      timestamp: new Date().toISOString(),
      commit: 'none',
      status: 'corrected'
    });
    writeFileSync(progressPath, JSON.stringify(progress, null, 2));
  }
} catch (e) {
  console.error('Git check failed:', e);
}

console.log(JSON.stringify(progress, null, 2));