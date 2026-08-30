import os
import json

with open('/root/ntools/progress.json', 'r') as f:
    progress = json.load(f)

# Only today's built tools
today = "2026-08-29"
today_built = [entry['tool'] for entry in progress['log'] if entry.get('status') == 'built' and entry['timestamp'].startswith(today)]
print(f"Tools built TODAY ({today}): {len(today_built)}")
for tool in today_built:
    print(f"  - {tool}")

# Tools not built today
tools_dir = '/root/ntools/tools'
tool_dirs = [d for d in os.listdir(tools_dir) if os.path.isdir(os.path.join(tools_dir, d)) and d != '.gitkeep']
unbuilt = [t for t in tool_dirs if t not in today_built]
print(f"\nTools not built today ({len(unbuilt)}):")
for tool in sorted(unbuilt)[:10]:
    print(f"  - {tool}")