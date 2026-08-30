import json, os, re

# Read App.tsx and extract registered tools
with open('src/App.tsx', 'r') as f:
    content = f.read()

# Extract tool names from TOOL_REGISTRY
pattern = r"'([a-z0-9-]+)': \{\s*name: '"
matches = re.findall(pattern, content)
registered = set(matches)
print(f'Registered in TOOL_REGISTRY: {len(registered)}')
print(sorted(registered))

all_tools = [d for d in os.listdir('tools') if os.path.isdir(os.path.join('tools', d))]
print(f'All tools in /tools directory: {len(all_tools)}')

missing_from_registry = set(all_tools) - registered
print(f'Tools in directory but NOT in registry: {len(missing_from_registry)}')
print(sorted(missing_from_registry))

# Also check which tools are in registry but not in directory
extra_in_registry = registered - set(all_tools)
print(f'Tools in registry but NOT in directory: {len(extra_in_registry)}')
print(sorted(extra_in_registry))