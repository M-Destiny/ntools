# XML to JSON Converter

Convert XML documents to JSON with configurable parsing options.

## Features

- **Full XML support**: Handles elements, attributes, text content, CDATA
- **Attribute handling**: Configurable attribute prefix (default `@_`), can be disabled
- **Type parsing**: Automatically parses numbers and booleans
- **Text node naming**: Customizable text node property name (default `#text`)
- **Whitespace control**: Optional trimming of text content
- **Error handling**: Clear error messages for malformed XML

## Usage

1. Paste XML in the input field
2. Configure parsing options as needed
3. JSON output appears instantly
4. Click "Copy Output" to copy the result

## Options

| Option | Default | Description |
|--------|---------|-------------|
| Include Attributes | ✓ | Whether to include XML attributes in output |
| Attribute Prefix | `@_` | Prefix for attribute keys in JSON |
| Parse Numbers | ✓ | Convert numeric strings to numbers |
| Parse Booleans | ✓ | Convert "true"/"false" to booleans |
| Trim Whitespace | ✓ | Trim text node content |
| Text Node Name | `#text` | Property name for mixed content text |

## Example

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="1" category="fiction">
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <price>10.99</price>
    <inStock>true</inStock>
    <tags>
      <tag>classic</tag>
      <tag>novel</tag>
    </tags>
  </book>
</catalog>
```

**Output JSON:**
```json
{
  "catalog": {
    "book": {
      "@_id": "1",
      "@_category": "fiction",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "price": 10.99,
      "inStock": true,
      "tags": {
        "tag": ["classic", "novel"]
      }
    }
  }
}
```

## Implementation Details

- Client-side only using browser's `DOMParser`
- Handles repeated elements as arrays automatically
- Mixed content (elements + text) uses configurable text node name
- Self-contained React + TypeScript component

## Component

```tsx
import XmlToJson from './tools/xml-to-json';
```

No external dependencies beyond React.