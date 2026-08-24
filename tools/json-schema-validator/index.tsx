import { useState, useCallback } from 'react';

interface JSONSchema7 {
  type?: string | string[];
  required?: string[];
  properties?: Record<string, JSONSchema7>;
  patternProperties?: Record<string, JSONSchema7>;
  additionalProperties?: boolean | JSONSchema7;
  items?: JSONSchema7 | JSONSchema7[];
  additionalItems?: boolean | JSONSchema7;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  enum?: unknown[];
  const?: unknown;
  minimum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  default?: unknown;
}

export default function JsonSchemaValidator() {
  const [jsonInput, setJsonInput] = useState('');
  const [schemaInput, setSchemaInput] = useState('');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'validate' | 'schema'>('validate');
  const [schemaExample, setSchemaExample] = useState<string>('');

  const examples = {
    user: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "name": { "type": "string", "minLength": 1, "maxLength": 100 },
    "email": { "type": "string", "format": "email" },
    "age": { "type": "integer", "minimum": 0, "maximum": 150 },
    "roles": {
      "type": "array",
      "items": { "type": "string", "enum": ["admin", "user", "guest"] },
      "minItems": 1,
      "uniqueItems": true
    },
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "zipCode": { "type": "string", "pattern": "^\\d{5}(-\\d{4})?$" }
      },
      "required": ["street", "city", "zipCode"]
    }
  },
  "required": ["id", "name", "email", "roles"],
  "additionalProperties": false
}`,
    product: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "sku": { "type": "string", "pattern": "^[A-Z]{3}-\\d{4}$" },
    "name": { "type": "string", "minLength": 1 },
    "price": { "type": "number", "exclusiveMinimum": 0 },
    "currency": { "type": "string", "enum": ["USD", "EUR", "GBP", "JPY"], "default": "USD" },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true,
      "maxItems": 20
    },
    "dimensions": {
      "type": "object",
      "properties": {
        "length": { "type": "number", "minimum": 0 },
        "width": { "type": "number", "minimum": 0 },
        "height": { "type": "number", "minimum": 0 },
        "unit": { "type": "string", "enum": ["cm", "in", "m", "ft"] }
      },
      "required": ["length", "width", "height", "unit"]
    },
    "inStock": { "type": "boolean" }
  },
  "required": ["sku", "name", "price", "currency", "dimensions", "inStock"]
}`,
    apiResponse: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "status": { "type": "string", "enum": ["success", "error", "partial"] },
    "timestamp": { "type": "string", "format": "date-time" },
    "data": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string", "format": "uuid" },
              "type": { "type": "string" },
              "attributes": { "type": "object" }
            },
            "required": ["id", "type", "attributes"]
          }
        },
        "pagination": {
          "type": "object",
          "properties": {
            "page": { "type": "integer", "minimum": 1 },
            "perPage": { "type": "integer", "minimum": 1, "maximum": 100 },
            "total": { "type": "integer", "minimum": 0 }
          },
          "required": ["page", "perPage", "total"]
        }
      },
      "required": ["items", "pagination"]
    },
    "meta": {
      "type": "object",
      "properties": {
        "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
        "requestId": { "type": "string", "format": "uuid" }
      },
      "required": ["version", "requestId"]
    }
  },
  "required": ["status", "timestamp", "data", "meta"]
}`
  };

  const validateJson = useCallback(() => {
    try {
      const jsonData = JSON.parse(jsonInput);
      const schema = JSON.parse(schemaInput);

      // Simple schema validation implementation
      const errors = validate(jsonData, schema);
      setValidationResult({
        valid: errors.length === 0,
        errors
      });
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown error';
      setValidationResult({
        valid: false,
        errors: [error]
      });
    }
  }, [jsonInput, schemaInput]);

  const loadSchemaExample = useCallback((key: keyof typeof examples) => {
    setSchemaInput(examples[key]);
    setSchemaExample(key);
  }, []);

  const loadJsonExample = useCallback((key: keyof typeof examples) => {
    // Generate a valid example JSON based on the schema
    const schema = examples[key];
    try {
      const parsed = JSON.parse(schema);
      const example = generateExample(parsed);
      setJsonInput(JSON.stringify(example, null, 2));
    } catch {
      // Fallback
      setJsonInput('{}');
    }
  }, []);

  const clearAll = useCallback(() => {
    setJsonInput('');
    setSchemaInput('');
    setValidationResult(null);
  }, []);

  const copyErrors = useCallback(() => {
    if (validationResult) {
      navigator.clipboard.writeText(validationResult.errors.join('\n'));
    }
  }, [validationResult]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JSON Schema Validator</h2>
        <p className="tool-desc">
          Validate JSON data against JSON Schema (Draft 7). Check compliance, find errors, and test schemas with examples.
        </p>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'validate' ? 'active' : ''}
          onClick={() => setActiveTab('validate')}
        >
          Validate JSON
        </button>
        <button
          className={activeTab === 'schema' ? 'active' : ''}
          onClick={() => setActiveTab('schema')}
        >
          Schema Examples
        </button>
      </div>

      {activeTab === 'validate' && (
        <div className="tool-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>JSON Schema</h3>
              <div className="panel-actions">
                <select
                  value={schemaExample}
                  onChange={e => loadSchemaExample(e.target.value as keyof typeof examples)}
                  className="example-select"
                >
                  <option value="">-- Select Example Schema --</option>
                  <option value="user">User Object</option>
                  <option value="product">Product Catalog</option>
                  <option value="apiResponse">API Response</option>
                </select>
              </div>
            </div>
            <textarea
              value={schemaInput}
              onChange={e => setSchemaInput(e.target.value)}
              placeholder='Paste your JSON Schema here...'
              className="code-editor"
              spellCheck={false}
            />
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>JSON Data</h3>
              <div className="panel-actions">
                <select
                  value={schemaExample}
                  onChange={e => loadJsonExample(e.target.value as keyof typeof examples)}
                  className="example-select"
                >
                  <option value="">-- Load Matching JSON --</option>
                  <option value="user">User Object</option>
                  <option value="product">Product Catalog</option>
                  <option value="apiResponse">API Response</option>
                </select>
              </div>
            </div>
            <textarea
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              placeholder='Paste your JSON data here...'
              className="code-editor"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="schema-examples">
          {Object.entries(examples).map(([key, value]) => (
            <div key={key} className="schema-example-card">
              <div className="schema-example-header">
                <h4>{key.charAt(0).toUpperCase() + key.slice(1)} Schema</h4>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(value);
                    setSchemaInput(value);
                  }}
                >
                  Copy & Load
                </button>
              </div>
              <pre className="schema-preview"><code>{value}</code></pre>
            </div>
          ))}
        </div>
      )}

      <div className="action-bar">
        <button className="primary-btn" onClick={validateJson} disabled={!jsonInput.trim() || !schemaInput.trim()}>
          Validate
        </button>
        <button className="secondary-btn" onClick={clearAll}>
          Clear All
        </button>
      </div>

      {validationResult && (
        <div className={`result-panel ${validationResult.valid ? 'success' : 'error'}`}>
          <div className="result-header">
            <span className={validationResult.valid ? 'valid-badge' : 'invalid-badge'}>
              {validationResult.valid ? '✓ Valid' : '✗ Invalid'}
            </span>
            {validationResult.errors.length > 0 && (
              <button className="copy-btn" onClick={copyErrors}>
                Copy Errors
              </button>
            )}
          </div>
          {validationResult.errors.length > 0 && (
            <div className="errors-list">
              {validationResult.errors.map((error, i) => (
                <div key={i} className="error-item">
                  <span className="error-number">{i + 1}.</span>
                  <span className="error-message">{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function validate(data: unknown, schema: JSONSchema7, path = ''): string[] {
  const errors: string[] = [];

  // Type validation
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const dataType = getJsonType(data);
    if (!types.includes(dataType)) {
      errors.push(`${path || 'root'}: Expected type ${types.join(' or ')}, got ${dataType}`);
    }
  }

  // Required properties
  if (schema.required && typeof data === 'object' && data !== null && !Array.isArray(data)) {
    for (const req of schema.required) {
      if (!(req in data)) {
        errors.push(`${path || 'root'}: Required property "${req}" is missing`);
      }
    }
  }

  // Properties validation
  if (schema.properties && typeof data === 'object' && data !== null && !Array.isArray(data)) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in data) {
        const newPath = path ? `${path}.${key}` : key;
        errors.push(...validate(data[key], propSchema as JSONSchema7, newPath));
      }
    }
  }

  // Additional properties
  if (schema.additionalProperties === false && typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const allowedProps = new Set([
      ...Object.keys(schema.properties || {}),
      ...Object.keys(schema.patternProperties || {})
    ]);
    for (const key of Object.keys(data)) {
      if (!allowedProps.has(key)) {
        let matched = false;
        const patternProps = schema.patternProperties || {};
        for (const pattern of Object.keys(patternProps)) {
          if (new RegExp(pattern).test(key)) {
            matched = true;
            break;
          }
        }
        if (!matched) {
          errors.push(`${path || 'root'}: Additional property "${key}" is not allowed`);
        }
      }
    }
  }

  // Pattern properties
  if (schema.patternProperties && typeof data === 'object' && data !== null && !Array.isArray(data)) {
    for (const [pattern, propSchema] of Object.entries(schema.patternProperties)) {
      const regex = new RegExp(pattern);
      for (const key of Object.keys(data)) {
        if (regex.test(key) && !(key in (schema.properties || {}))) {
          const newPath = path ? `${path}.${key}` : key;
          errors.push(...validate(data[key], propSchema as JSONSchema7, newPath));
        }
      }
    }
  }

  // Array validation
  if (schema.items && Array.isArray(data)) {
    if (Array.isArray(schema.items)) {
      // Tuple validation
      for (let i = 0; i < data.length; i++) {
        if (i < schema.items.length) {
          errors.push(...validate(data[i], schema.items[i] as JSONSchema7, `${path}[${i}]`));
        } else if (schema.additionalItems === false) {
          errors.push(`${path}[${i}]: Additional items not allowed in tuple`);
        } else if (schema.additionalItems) {
          errors.push(...validate(data[i], schema.additionalItems as JSONSchema7, `${path}[${i}]`));
        }
      }
    } else {
      // Uniform array validation
      for (let i = 0; i < data.length; i++) {
        errors.push(...validate(data[i], schema.items as JSONSchema7, `${path}[${i}]`));
      }
    }

    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push(`${path}: Array must have at least ${schema.minItems} items (got ${data.length})`);
    }
    if (schema.maxItems !== undefined && data.length > schema.maxItems) {
      errors.push(`${path}: Array must have at most ${schema.maxItems} items (got ${data.length})`);
    }
    if (schema.uniqueItems) {
      const seen = new Set();
      for (let i = 0; i < data.length; i++) {
        const str = JSON.stringify(data[i]);
        if (seen.has(str)) {
          errors.push(`${path}[${i}]: Duplicate array item (uniqueItems: true)`);
        }
        seen.add(str);
      }
    }
  }

  // String validation
  if (schema.type === 'string' || (Array.isArray(schema.type) && schema.type.includes('string'))) {
    if (typeof data === 'string') {
      if (schema.minLength !== undefined && data.length < schema.minLength) {
        errors.push(`${path}: String length must be at least ${schema.minLength} (got ${data.length})`);
      }
      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        errors.push(`${path}: String length must be at most ${schema.maxLength} (got ${data.length})`);
      }
      if (schema.pattern) {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(data)) {
          errors.push(`${path}: String does not match pattern ${schema.pattern}`);
        }
      }
      if (schema.format) {
        const formatError = validateFormat(data, schema.format, path);
        if (formatError) errors.push(formatError);
      }
      if (schema.enum && !schema.enum.includes(data)) {
        errors.push(`${path}: Value must be one of [${schema.enum.map((e: unknown) => JSON.stringify(e)).join(', ')}]`);
      }
    }
  }

  // Number validation
  if (schema.type === 'number' || schema.type === 'integer' || 
      (Array.isArray(schema.type) && (schema.type.includes('number') || schema.type.includes('integer')))) {
    if (typeof data === 'number') {
      if (schema.minimum !== undefined && data < schema.minimum) {
        errors.push(`${path}: Number must be >= ${schema.minimum} (got ${data})`);
      }
      if (schema.exclusiveMinimum !== undefined && data <= schema.exclusiveMinimum) {
        errors.push(`${path}: Number must be > ${schema.exclusiveMinimum} (got ${data})`);
      }
      if (schema.maximum !== undefined && data > schema.maximum) {
        errors.push(`${path}: Number must be <= ${schema.maximum} (got ${data})`);
      }
      if (schema.exclusiveMaximum !== undefined && data >= schema.exclusiveMaximum) {
        errors.push(`${path}: Number must be < ${schema.exclusiveMaximum} (got ${data})`);
      }
      if (schema.type === 'integer' && !Number.isInteger(data)) {
        errors.push(`${path}: Expected integer, got float ${data}`);
      }
      if (schema.enum && !schema.enum.includes(data)) {
        errors.push(`${path}: Value must be one of [${schema.enum.join(', ')}]`);
      }
    }
  }

  // Enum validation (general)
  if (schema.enum && !errors.some(e => e.includes('must be one of'))) {
    const enumValues = schema.enum.map((e: unknown) => JSON.stringify(e));
    if (!enumValues.includes(JSON.stringify(data))) {
      errors.push(`${path}: Value must be one of [${enumValues.join(', ')}]`);
    }
  }

  // Const validation
  if (schema.const !== undefined) {
    if (JSON.stringify(data) !== JSON.stringify(schema.const)) {
      errors.push(`${path}: Value must equal ${JSON.stringify(schema.const)}`);
    }
  }

  return errors;
}

function getJsonType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function validateFormat(value: string, format: string, path: string): string | null {
  switch (format) {
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return `${path}: Invalid email format`;
      }
      break;
    case 'date-time':
      if (isNaN(Date.parse(value))) {
        return `${path}: Invalid date-time format (ISO 8601 expected)`;
      }
      break;
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || isNaN(Date.parse(value))) {
        return `${path}: Invalid date format (YYYY-MM-DD expected)`;
      }
      break;
    case 'time':
      if (!/^(\d{2}:\d{2}(:\d{2})?(\.\d+)?)(Z|[+-]\d{2}:\d{2})?$/.test(value)) {
        return `${path}: Invalid time format`;
      }
      break;
    case 'uuid':
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        return `${path}: Invalid UUID format`;
      }
      break;
    case 'uri':
      try { new URL(value); } catch { return `${path}: Invalid URI format`; }
      break;
    case 'ipv4':
      if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(value) || value.split('.').some(n => parseInt(n) > 255)) {
        return `${path}: Invalid IPv4 format`;
      }
      break;
    case 'ipv6':
      // Simplified IPv6 check
      if (!/^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(value) && !/^::/.test(value)) {
        return `${path}: Invalid IPv6 format`;
      }
      break;
  }
  return null;
}

function generateExample(schema: JSONSchema7): unknown {
  if (schema.const !== undefined) return schema.const;
  if (schema.enum && schema.enum.length > 0) return schema.enum[0];
  if (schema.default !== undefined) return schema.default;

  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : ['object'];
  const type = types[0];

  switch (type) {
    case 'string':
      if (schema.format === 'email') return 'user@example.com';
      if (schema.format === 'date-time') return new Date().toISOString();
      if (schema.format === 'date') return new Date().toISOString().split('T')[0];
      if (schema.format === 'uuid') return '550e8400-e29b-41d4-a716-446655440000';
      if (schema.format === 'uri') return 'https://example.com';
      if (schema.pattern) return 'example';
      return 'example string';
    case 'number':
    case 'integer':
      return schema.minimum ?? 42;
    case 'boolean':
      return true;
    case 'array':
      const itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;
      const count = schema.minItems ?? 1;
      return Array(count).fill(0).map(() => itemSchema ? generateExample(itemSchema as JSONSchema7) : {});
    case 'object':
    default:
      const obj: Record<string, unknown> = {};
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (schema.required?.includes(key) || Math.random() > 0.5) {
            obj[key] = generateExample(propSchema as JSONSchema7);
          }
        }
      }
      return obj;
  }
}