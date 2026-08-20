# JSON to TypeScript

Convert JSON to TypeScript interfaces or type aliases. Generates clean, typed definitions from JSON structures.

## Features

- Converts JSON objects to TypeScript interfaces or type aliases
- Handles nested objects and arrays automatically
- Infers types: string, number, boolean, Date, null
- Configurable: readonly, optional fields, semicolons, strict null checks
- One-click copy to clipboard
- Load example JSON for testing

## Usage

1. Paste your JSON in the left panel
2. Configure options in the middle panel:
   - **Use interfaces** — Generate `interface` instead of `type` aliases
   - **Mark properties as readonly** — Add `readonly` modifier to all properties
   - **Make all fields optional** — Add `?` to all properties
   - **Include semicolons** — Add semicolons after each property
   - **Strict null checks** — Union types with `null` for nullable fields
   - **Root Type Name** — Set the name for the root type
3. Copy the generated TypeScript from the right panel

## Example

**Input JSON:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "isActive": true,
  "roles": ["admin", "user"],
  "profile": {
    "avatar": "https://example.com/avatar.png",
    "bio": "Software developer"
  }
}
```

**Output TypeScript (interface):**
```typescript
interface Root {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  roles: string[];
  profile: {
    avatar: string;
    bio: string;
  };
}
```

## Implementation Details

- Uses recursive type generation for nested structures
- Handles arrays by inferring type from first element
- Detects ISO date strings and suggests `Date | string` type
- Pure client-side — no data leaves your browser