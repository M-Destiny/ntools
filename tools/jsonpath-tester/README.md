# JSONPath Tester

Test and evaluate JSONPath expressions against JSON data in real-time.

## Features

- **Real-time evaluation** - Results update instantly as you type
- **Sample data included** - Pre-loaded bookstore example for quick testing
- **Example queries** - One-click common JSONPath expressions
- **Syntax reference** - Built-in JSONPath syntax guide
- **Copy results** - Export all matches with paths
- **Error highlighting** - Clear JSON and expression error messages

## JSONPath Syntax Supported

| Syntax | Description |
|--------|-------------|
| `$` | Root object |
| `@` | Current object |
| `.` or `[]` | Child operator |
| `..` | Recursive descent (all descendants) |
| `*` | Wildcard (all elements/objects) |
| `[n]` | Array index (0-based, negative for reverse) |
| `[m:n]` | Array slice |
| `[?(@.prop)]` | Filter by property existence |
| `[?(@.prop > 10)]` | Comparison filter |
| `[?(@.prop =~ /regex/)]` | Regex filter |

## Examples

Using the sample bookstore data:

**Get all book authors:**
```
$.store.book[*].author
```
Returns: `["Nigel Rees", "Evelyn Waugh", "Herman Melville", "J. R. R. Tolkien"]`

**Get all prices recursively:**
```
$.store..price
```
Returns: `[8.95, 12.99, 8.99, 22.99, 19.95, 50, 30]`

**Filter books under $10:**
```
$.store.book[?(@.price < 10)]
```
Returns books with price < 10

**Get first book:**
```
$.store.book[0]
```

**Get books that have ISBN:**
```
$.store.book[?(@.isbn)]
```

## Usage

1. Paste your JSON in the left panel (or use the sample)
2. Enter a JSONPath expression in the middle panel
3. View results in the right panel
4. Click "Copy Results" to copy all matches with their paths

## Notes

- Filter expressions (`?(...)`) are parsed but evaluation is simplified
- For production use, consider a full JSONPath library like `jsonpath-plus`
- The tool uses a custom lightweight implementation for zero dependencies