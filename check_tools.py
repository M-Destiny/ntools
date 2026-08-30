import os
import json
import re

# Get all tool directories
tools_dir = '/root/ntools/tools'
all_tools = set(os.listdir(tools_dir))

# Load App.tsx and extract registered tools
with open('/root/ntools/src/App.tsx', 'r') as f:
    content = f.read()

# Extract tool names from TOOL_REGISTRY
registered = set()
for match in re.finditer(r"'([^']+)':\s*\{\s*name:\s*'([^']+)'", content):
    registered.add(match.group(2))

print(f"Total tools in /tools: {len(all_tools)}")
print(f"Registered in App.tsx: {len(registered)}")
print(f"\nUnregistered tools:")
unregistered = sorted(all_tools - registered)
for t in unregistered:
    has_index = os.path.exists(os.path.join(tools_dir, t, 'index.tsx'))
    has_readme = os.path.exists(os.path.join(tools_dir, t, 'README.md'))
    print(f"  {t}: index.tsx={has_index}, README.md={has_readme}")

# Also check which tools were built today (from progress.json)
with open('/root/ntools/progress.json', 'r') as f:
    progress = json.load(f)

today = '2026-08-29'
built_today = set()
for entry in progress['log']:
    if entry.get('timestamp', '').startswith(today) and entry.get('status') == 'built':
        built_today.add(entry['tool'])

print(f"\nBuilt today ({today}): {len(built_today)}")
for t in sorted(built_today):
    print(f"  {t}")

# Find unregistered tools that are complete (have both files)
complete_unregistered = []
for t in unregistered:
    has_index = os.path.exists(os.path.join(tools_dir, t, 'index.tsx'))
    has_readme = os.path.exists(os.path.join(tools_dir, t, 'README.md'))
    if has_index and has_readme:
        complete_unregistered.append(t)

print(f"\nComplete unregistered tools (ready to build): {len(complete_unregistered)}")
for t in sorted(complete_unregistered):
    print(f"  {t}")