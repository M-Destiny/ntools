import re
with open('src/App.tsx') as f:
    content = f.read()
tools = re.findall(r"name:\s*'([^']+)'", content)
print(f'Total in registry: {len(tools)}')
for t in ['api-tester', 'aspect-ratio-calculator']:
    print(f'{t}: {"YES" if t in tools else "NO"}')