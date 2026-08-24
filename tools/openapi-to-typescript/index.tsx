import { useState, useCallback } from 'react';

export default function OpenApiToTypescript() {
  const [openApiInput, setOpenApiInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<'interfaces' | 'types' | 'zod'>('interfaces');
  const [options, setOptions] = useState({
    includeValidation: true,
    useReadonly: true,
    useConst: false,
    optionalStrategy: 'undefined' as 'undefined' | 'optional',
    enumStyle: 'union' as 'union' | 'enum',
  });
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'convert' | 'examples'>('convert');

  const exampleOpenApi = `{
  "openapi": "3.0.0",
  "info": {
    "title": "User API",
    "version": "1.0.0"
  },
  "paths": {
    "/users": {
      "get": {
        "summary": "List users",
        "responses": {
          "200": {
            "description": "List of users",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/User" }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Create user",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateUserRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User created",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/User" }
              }
            }
          }
        }
      }
    },
    "/users/{id}": {
      "get": {
        "summary": "Get user by ID",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": {
          "200": {
            "description": "User found",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/User" }
              }
            }
          },
          "404": { "description": "User not found" }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "required": ["id", "email", "name", "role", "createdAt"],
        "properties": {
          "id": { "type": "string", "format": "uuid" },
          "email": { "type": "string", "format": "email" },
          "name": { "type": "string", "minLength": 1, "maxLength": 100 },
          "role": { "type": "string", "enum": ["admin", "user", "guest"] },
          "createdAt": { "type": "string", "format": "date-time" },
          "avatarUrl": { "type": "string", "format": "uri", "nullable": true }
        }
      },
      "CreateUserRequest": {
        "type": "object",
        "required": ["email", "name", "role"],
        "properties": {
          "email": { "type": "string", "format": "email" },
          "name": { "type": "string", "minLength": 1, "maxLength": 100 },
          "role": { "type": "string", "enum": ["user", "guest"] }
        }
      }
    }
  }
}`;

  const parseOpenApi = useCallback((json: any) => {
    const schemas = json.components?.schemas || {};
    const results: string[] = [];

    // Add header
    results.push('// Generated from OpenAPI 3.0 specification');
    results.push('// DO NOT EDIT MANUALLY - Regenerate when API spec changes');
    results.push('');

    // Generate types for each schema
    Object.entries(schemas).forEach(([name, schema]: [string, any]) => {
      if (schema.type === 'object') {
        results.push(generateType(name, schema, schemas, ''));
        results.push('');
      }
    });

    return results.join('\n');
  }, []);

  const generateType = (name: string, schema: any, allSchemas: any, indent: string): string => {
    const lines: string[] = [];
    const required = new Set(schema.required || []);
    const props = schema.properties || {};

    if (format === 'interfaces') {
      lines.push(`${indent}export interface ${name} {`);
      Object.entries(props).forEach(([propName, propSchema]: [string, any]) => {
        const isRequired = required.has(propName);
        const tsType = schemaToTsType(propSchema, allSchemas, propName);
        const modifier = isRequired ? '' : options.optionalStrategy === 'optional' ? '?' : '';
        const readonly = options.useReadonly && isRequired ? 'readonly ' : '';
        lines.push(`${indent}  ${readonly}${propName}${modifier}: ${tsType};`);
      });
      lines.push(`${indent}}`);
    } else if (format === 'types') {
      lines.push(`${indent}export type ${name} = {`);
      Object.entries(props).forEach(([propName, propSchema]: [string, any]) => {
        const isRequired = required.has(propName);
        const tsType = schemaToTsType(propSchema, allSchemas, propName);
        const modifier = isRequired ? '' : options.optionalStrategy === 'optional' ? '?' : '';
        const readonly = options.useReadonly && isRequired ? 'readonly ' : '';
        lines.push(`${indent}  ${readonly}${propName}${modifier}: ${tsType};`);
      });
      lines.push(`${indent}};`);
    } else if (format === 'zod') {
      lines.push(`${indent}export const ${name}Schema = z.object({`);
      Object.entries(props).forEach(([propName, propSchema]: [string, any]) => {
        const isRequired = required.has(propName);
        const zodType = schemaToZod(propSchema, allSchemas, propName, isRequired);
        lines.push(`${indent}  ${propName}: ${zodType},`);
      });
      lines.push(`${indent}});`);
      lines.push(`${indent}export type ${name} = z.infer<typeof ${name}Schema>;`);
    }

    return lines.join('\n');
  };

  const schemaToTsType = (schema: any, allSchemas: any, propName: string): string => {
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop()!;
      return refName;
    }

    const { type, format, enum: enumValues, items, anyOf, oneOf, allOf, nullable, properties } = schema;

    if (anyOf || oneOf) {
      const types = (anyOf || oneOf).map((s: any) => schemaToTsType(s, allSchemas, propName));
      return types.join(' | ');
    }

    if (allOf) {
      const types = allOf.map((s: any) => schemaToTsType(s, allSchemas, propName));
      return types.join(' & ');
    }

    if (enumValues) {
      if (options.enumStyle === 'enum') {
        return `typeof ${propName}Enum[keyof typeof ${propName}Enum]`;
      }
      return enumValues.map((v: any) => typeof v === 'string' ? `"${v}"` : String(v)).join(' | ');
    }

    if (type === 'array') {
      const itemType = items ? schemaToTsType(items, allSchemas, propName) : 'unknown';
      return `${itemType}[]`;
    }

    if (type === 'object' && properties) {
      return `{ ${Object.entries(properties).map(([k, v]: [string, any]) => 
        `${k}: ${schemaToTsType(v, allSchemas, k)}`
      ).join('; ')} }`;
    }

    switch (type) {
      case 'string':
        if (format === 'date-time') return 'Date';
        if (format === 'date') return 'Date';
        if (format === 'uuid') return 'string';
        if (format === 'email') return 'string';
        if (format === 'uri') return 'string';
        if (format === 'binary') return 'Blob';
        if (format === 'byte') return 'string';
        return 'string';
      case 'integer':
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'null':
        return 'null';
      default:
        return 'unknown';
    }
  };

  const schemaToZod = (schema: any, allSchemas: any, propName: string, isRequired: boolean): string => {
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop()!;
      return `${refName}Schema`;
    }

    const { type, format, enum: enumValues, items, anyOf, oneOf, allOf, nullable, properties, minimum, maximum, minLength, maxLength, pattern } = schema;

    if (anyOf || oneOf) {
      const types = (anyOf || oneOf).map((s: any) => schemaToZod(s, allSchemas, propName, true));
      return `z.union([${types.join(', ')}])`;
    }

    if (allOf) {
      const types = allOf.map((s: any) => schemaToZod(s, allSchemas, propName, true));
      return `z.intersection(${types[0]}, ${types[1]})`; // Simplified
    }

    let zodType = 'z.unknown()';

    if (enumValues) {
      zodType = `z.enum([${enumValues.map((v: any) => typeof v === 'string' ? `"${v}"` : String(v)).join(', ')}])`;
    } else if (type === 'array') {
      const itemType = items ? schemaToZod(items, allSchemas, propName, true) : 'z.unknown()';
      zodType = `z.array(${itemType})`;
    } else if (type === 'object' && properties) {
      const shape = Object.entries(properties).map(([k, v]: [string, any]) => 
        `${k}: ${schemaToZod(v, allSchemas, k, (v as any).required?.includes(k))}`
      ).join(', ');
      zodType = `z.object({ ${shape} })`;
    } else {
      switch (type) {
        case 'string':
          if (format === 'date-time' || format === 'date') zodType = 'z.string().datetime()';
          else if (format === 'uuid') zodType = 'z.string().uuid()';
          else if (format === 'email') zodType = 'z.string().email()';
          else if (format === 'uri') zodType = 'z.string().url()';
          else zodType = 'z.string()';
          if (minLength !== undefined) zodType += `.min(${minLength})`;
          if (maxLength !== undefined) zodType += `.max(${maxLength})`;
          if (pattern) zodType += `.regex(${pattern})`;
          break;
        case 'integer':
          zodType = 'z.number().int()';
          if (minimum !== undefined) zodType += `.min(${minimum})`;
          if (maximum !== undefined) zodType += `.max(${maximum})`;
          break;
        case 'number':
          zodType = 'z.number()';
          if (minimum !== undefined) zodType += `.min(${minimum})`;
          if (maximum !== undefined) zodType += `.max(${maximum})`;
          break;
        case 'boolean':
          zodType = 'z.boolean()';
          break;
        case 'null':
          zodType = 'z.null()';
          break;
        default:
          zodType = 'z.unknown()';
      }
    }

    if (nullable) {
      zodType = `${zodType}.nullable()`;
    }

    if (!isRequired && options.optionalStrategy === 'optional') {
      zodType = `${zodType}.optional()`;
    } else if (!isRequired) {
      zodType = `${zodType}.optional().or(z.undefined())`;
    }

    return zodType;
  };

  const convert = useCallback(() => {
    setError(null);
    if (!openApiInput.trim()) {
      setError('Please provide an OpenAPI specification');
      return;
    }

    try {
      const spec = JSON.parse(openApiInput);
      if (!spec.openapi || !spec.openapi.startsWith('3.')) {
        setError('Only OpenAPI 3.x specifications are supported');
        return;
      }

      let result = parseOpenApi(spec);

      if (format === 'zod') {
        result = `import { z } from 'zod';\n\n${result}`;
      }

      setOutput(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }, [openApiInput, format, options, parseOpenApi]);

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    const ext = format === 'zod' ? 'ts' : 'ts';
    const blob = new Blob([output], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openapi-types.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    setOpenApiInput(exampleOpenApi);
    convert();
  };

  const clearAll = () => {
    setOpenApiInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>OpenAPI to TypeScript</h2>
        <p className="tool-desc">Convert OpenAPI 3.x schemas to TypeScript interfaces, types, or Zod schemas with validation.</p>
      </div>

      <div className="tabs">
        <button className={activeTab === 'convert' ? 'active' : ''} onClick={() => setActiveTab('convert')}>
          Convert
        </button>
        <button className={activeTab === 'examples' ? 'active' : ''} onClick={() => setActiveTab('examples')}>
          Example Spec
        </button>
      </div>

      {activeTab === 'convert' && (
        <div className="converter-layout">
          <div className="editor-panel">
            <div className="editor-toolbar">
              <h3>OpenAPI Spec (JSON)</h3>
              <div className="toolbar-actions">
                <button onClick={loadExample} className="btn-secondary">Load Example</button>
                <button onClick={clearAll} className="btn-secondary">Clear</button>
              </div>
            </div>
            <textarea
              className="json-editor"
              value={openApiInput}
              onChange={(e) => setOpenApiInput(e.target.value)}
              placeholder="Paste OpenAPI 3.x JSON specification here..."
              spellCheck={false}
            />
            {error && <div className="error-message">✗ {error}</div>}
          </div>

          <div className="controls-panel">
            <div className="option-group">
              <label>Output Format</label>
              <div className="mode-buttons">
                {(['interfaces', 'types', 'zod'] as const).map(f => (
                  <button
                    key={f}
                    className={format === f ? 'active' : ''}
                    onClick={() => { setFormat(f); convert(); }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <label>Options</label>
              <div className="checkbox-grid">
                <label>
                  <input
                    type="checkbox"
                    checked={options.includeValidation}
                    onChange={(e) => setOptions({ ...options, includeValidation: e.target.checked })}
                  />
                  Include Validation
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={options.useReadonly}
                    onChange={(e) => setOptions({ ...options, useReadonly: e.target.checked })}
                  />
                  Use Readonly
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={options.useConst}
                    onChange={(e) => setOptions({ ...options, useConst: e.target.checked })}
                  />
                  Use Const for Enums
                </label>
              </div>
              <div className="select-grid">
                <div>
                  <label>Optional Strategy</label>
                  <select
                    value={options.optionalStrategy}
                    onChange={(e) => setOptions({ ...options, optionalStrategy: e.target.value as any })}
                    onBlur={convert}
                  >
                    <option value="undefined">| undefined</option>
                    <option value="optional">?</option>
                  </select>
                </div>
                <div>
                  <label>Enum Style</label>
                  <select
                    value={options.enumStyle}
                    onChange={(e) => setOptions({ ...options, enumStyle: e.target.value as any })}
                    onBlur={convert}
                  >
                    <option value="union">Union Types</option>
                    <option value="enum">TypeScript Enum</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="action-bar">
              <button className="primary-btn" onClick={convert} disabled={!openApiInput.trim()}>
                Generate Types
              </button>
            </div>
          </div>

          <div className="editor-panel">
            <div className="editor-toolbar">
              <h3>TypeScript Output</h3>
              <div className="toolbar-actions">
                <button onClick={copyOutput} className={copied ? 'copied' : ''}>
                  {copied ? '✓ Copied!' : 'Copy Output'}
                </button>
                <button onClick={downloadOutput} className="btn-secondary">Download .ts</button>
              </div>
            </div>
            <textarea
              className="json-editor output"
              value={output}
              readOnly
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {activeTab === 'examples' && (
        <div className="example-panel">
          <div className="example-toolbar">
            <button onClick={loadExample} className="btn-primary">Load Example & Convert</button>
          </div>
          <pre className="example-code"><code>{exampleOpenApi}</code></pre>
        </div>
      )}
    </div>
  );
}