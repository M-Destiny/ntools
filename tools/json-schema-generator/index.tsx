import { useState } from 'react';

interface SchemaField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description: string;
  children?: SchemaField[];
  enumValues?: string;
  min?: string;
  max?: string;
  pattern?: string;
  defaultValue?: string;
}

const TYPE_OPTIONS = [
  'string', 'number', 'integer', 'boolean', 'array', 'object', 'null'
];

const STRING_FORMATS = ['', 'date', 'date-time', 'email', 'uuid', 'uri', 'ipv4', 'ipv6', 'hostname', 'json-pointer', 'regex'];

const INITIAL_FIELD: SchemaField = {
  id: crypto.randomUUID(),
  name: '',
  type: 'string',
  required: false,
  description: '',
};

export default function JsonSchemaGenerator() {
  const [fields, setFields] = useState<SchemaField[]>([{ ...INITIAL_FIELD, name: 'id', type: 'string', required: true }]);
  const [schemaTitle, setSchemaTitle] = useState('My Schema');
  const [schemaDescription, setSchemaDescription] = useState('');
  const [schemaVersion, setSchemaVersion] = useState('1.0.0');
  const [outputFormat, setOutputFormat] = useState<'json' | 'yaml'>('json');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (id: string, updates: Partial<SchemaField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const addField = (parentId?: string) => {
    const newField = { ...INITIAL_FIELD };
    setFields(prev => {
      if (!parentId) return [...prev, newField];
      return prev.map(f => {
        if (f.id === parentId) {
          return { ...f, children: [...(f.children || []), newField] };
        }
        if (f.children) {
          return { ...f, children: f.children.map(c => c.id === parentId ? { ...c, children: [...(c.children || []), newField] } : c) };
        }
        return f;
      });
    });
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id).map(f => ({
      ...f,
      children: f.children?.filter(c => c.id !== id).map(c => ({
        ...c,
        children: c.children?.filter(gc => gc.id !== id)
      }))
    })));
  };

  const addChildField = (parentId: string) => addField(parentId);

  const generateSchema = (fieldList: SchemaField[], isRoot = true): any => {
    if (isRoot) {
      return {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: schemaTitle,
        description: schemaDescription || undefined,
        version: schemaVersion,
        type: 'object',
        properties: generateProperties(fieldList),
        required: fieldList.filter(f => f.required).map(f => f.name),
        additionalProperties: false,
      };
    }

    const props: Record<string, any> = {};
    fieldList.forEach(f => {
      props[f.name] = generateFieldSchema(f);
    });
    return { type: 'object', properties: props, additionalProperties: false };
  };

  const generateProperties = (fieldList: SchemaField[]): Record<string, any> => {
    const props: Record<string, any> = {};
    fieldList.forEach(f => {
      props[f.name] = generateFieldSchema(f);
    });
    return props;
  };

  const generateFieldSchema = (field: SchemaField): any => {
    const base: any = {};
    if (field.description) base.description = field.description;

    switch (field.type) {
      case 'string': {
        base.type = 'string';
        const format = field.pattern ? undefined : field.enumValues ? undefined : undefined;
        if (field.enumValues) {
          const vals = field.enumValues.split(',').map(v => v.trim()).filter(v => v);
          if (vals.length > 0) base.enum = vals;
        }
        if (field.pattern) base.pattern = field.pattern;
        if (field.min) base.minLength = parseInt(field.min, 10);
        if (field.max) base.maxLength = parseInt(field.max, 10);
        if (field.defaultValue) base.default = field.defaultValue;
        break;
      }
      case 'number':
      case 'integer': {
        base.type = field.type;
        if (field.min !== undefined && field.min !== '') base.minimum = parseFloat(field.min);
        if (field.max !== undefined && field.max !== '') base.maximum = parseFloat(field.max);
        if (field.defaultValue) base.default = parseFloat(field.defaultValue);
        if (field.type === 'integer') base.multipleOf = 1;
        break;
      }
      case 'boolean': {
        base.type = 'boolean';
        if (field.defaultValue) base.default = field.defaultValue === 'true';
        break;
      }
      case 'array': {
        base.type = 'array';
        if (field.children && field.children.length > 0) {
          base.items = generateFieldSchema(field.children[0]);
        } else {
          base.items = { type: 'string' };
        }
        if (field.min) base.minItems = parseInt(field.min, 10);
        if (field.max) base.maxItems = parseInt(field.max, 10);
        break;
      }
      case 'object': {
        base.type = 'object';
        if (field.children && field.children.length > 0) {
          base.properties = generateProperties(field.children);
          base.required = field.children.filter(c => c.required).map(c => c.name);
        }
        base.additionalProperties = false;
        break;
      }
      case 'null': {
        base.type = 'null';
        break;
      }
    }
    return base;
  };

  const schema = generateSchema(fields);
  const output = outputFormat === 'json'
    ? JSON.stringify(schema, null, 2)
    : jsYamlDump(schema);

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSchema = () => {
    const blob = new Blob([output], { type: outputFormat === 'json' ? 'application/json' : 'application/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schemaTitle.toLowerCase().replace(/\s+/g, '-')}.${outputFormat === 'json' ? 'json' : 'yaml'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    setSchemaTitle('User Profile');
    setSchemaDescription('A user profile schema with nested address and preferences');
    setSchemaVersion('1.0.0');
    setFields([
      { id: crypto.randomUUID(), name: 'id', type: 'string', required: true, description: 'Unique identifier (UUID)', pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' },
      { id: crypto.randomUUID(), name: 'username', type: 'string', required: true, description: 'Unique username', min: '3', max: '30' },
      { id: crypto.randomUUID(), name: 'email', type: 'string', required: true, description: 'Email address', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
      { id: crypto.randomUUID(), name: 'age', type: 'integer', required: false, description: 'Age in years', min: '0', max: '150' },
      { id: crypto.randomUUID(), name: 'isActive', type: 'boolean', required: true, description: 'Account status', defaultValue: 'true' },
      { id: crypto.randomUUID(), name: 'tags', type: 'array', required: false, description: 'User tags', children: [{ id: crypto.randomUUID(), name: '', type: 'string', required: false, description: '' }] },
      {
        id: crypto.randomUUID(),
        name: 'address',
        type: 'object',
        required: false,
        description: 'Physical address',
        children: [
          { id: crypto.randomUUID(), name: 'street', type: 'string', required: true, description: 'Street address' },
          { id: crypto.randomUUID(), name: 'city', type: 'string', required: true, description: 'City' },
          { id: crypto.randomUUID(), name: 'postalCode', type: 'string', required: true, description: 'Postal code', pattern: '^\\d{5}(-\\d{4})?$' },
          { id: crypto.randomUUID(), name: 'country', type: 'string', required: true, description: 'Country code (ISO 3166-1 alpha-2)', min: '2', max: '2' },
        ]
      },
      {
        id: crypto.randomUUID(),
        name: 'preferences',
        type: 'object',
        required: false,
        description: 'User preferences',
        children: [
          { id: crypto.randomUUID(), name: 'theme', type: 'string', required: false, description: 'UI theme', enumValues: 'light, dark, auto' },
          { id: crypto.randomUUID(), name: 'notifications', type: 'boolean', required: false, description: 'Enable notifications', defaultValue: 'true' },
          { id: crypto.randomUUID(), name: 'language', type: 'string', required: false, description: 'Preferred language', enumValues: 'en, es, fr, de, zh, ja' },
        ]
      },
    ]);
  };

  const clearAll = () => {
    setSchemaTitle('My Schema');
    setSchemaDescription('');
    setSchemaVersion('1.0.0');
    setFields([{ ...INITIAL_FIELD, name: 'id', type: 'string', required: true }]);
    setError(null);
  };

  const validateSchema = () => {
    try {
      JSON.stringify(schema);
      setError(null);
      alert('Schema is valid!');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid schema');
    }
  };

  const renderField = (field: SchemaField, depth = 0): React.ReactNode => {
    const isObjectOrArray = field.type === 'object' || field.type === 'array';
    const hasChildren = field.children && field.children.length > 0;

    return (
      <div key={field.id} className={`schema-field ${depth > 0 ? 'nested' : ''}`} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="field-row">
          <input
            type="text"
            className="field-name"
            value={field.name}
            onChange={e => updateField(field.id, { name: e.target.value })}
            placeholder="fieldName"
            required
          />
          <select
            className="field-type"
            value={field.type}
            onChange={e => updateField(field.id, { type: e.target.value })}
          >
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="field-required">
            <input
              type="checkbox"
              checked={field.required}
              onChange={e => updateField(field.id, { required: e.target.checked })}
            />
            Required
          </label>
          <input
            type="text"
            className="field-desc"
            value={field.description}
            onChange={e => updateField(field.id, { description: e.target.value })}
            placeholder="Description"
          />
          {field.type === 'string' && (
            <>
              <input
                type="text"
                className="field-enum"
                value={field.enumValues || ''}
                onChange={e => updateField(field.id, { enumValues: e.target.value })}
                placeholder="enum: val1, val2"
              />
              <input
                type="text"
                className="field-pattern"
                value={field.pattern || ''}
                onChange={e => updateField(field.id, { pattern: e.target.value })}
                placeholder="regex pattern"
              />
              <input
                type="text"
                className="field-min"
                value={field.min || ''}
                onChange={e => updateField(field.id, { min: e.target.value })}
                placeholder="min"
              />
              <input
                type="text"
                className="field-max"
                value={field.max || ''}
                onChange={e => updateField(field.id, { max: e.target.value })}
                placeholder="max"
              />
              <input
                type="text"
                className="field-default"
                value={field.defaultValue || ''}
                onChange={e => updateField(field.id, { defaultValue: e.target.value })}
                placeholder="default"
              />
            </>
          )}
          {(field.type === 'number' || field.type === 'integer') && (
            <>
              <input
                type="text"
                className="field-min"
                value={field.min || ''}
                onChange={e => updateField(field.id, { min: e.target.value })}
                placeholder="min"
              />
              <input
                type="text"
                className="field-max"
                value={field.max || ''}
                onChange={e => updateField(field.id, { max: e.target.value })}
                placeholder="max"
              />
              <input
                type="text"
                className="field-default"
                value={field.defaultValue || ''}
                onChange={e => updateField(field.id, { defaultValue: e.target.value })}
                placeholder="default"
              />
            </>
          )}
          {field.type === 'boolean' && (
            <input
              type="text"
              className="field-default"
              value={field.defaultValue || ''}
              onChange={e => updateField(field.id, { defaultValue: e.target.value })}
              placeholder="default: true/false"
            />
          )}
          {field.type === 'array' && (
            <>
              <input
                type="text"
                className="field-min"
                value={field.min || ''}
                onChange={e => updateField(field.id, { min: e.target.value })}
                placeholder="minItems"
              />
              <input
                type="text"
                className="field-max"
                value={field.max || ''}
                onChange={e => updateField(field.id, { max: e.target.value })}
                placeholder="maxItems"
              />
            </>
          )}
          <div className="field-actions">
            {isObjectOrArray && (
              <button className="btn-icon" onClick={() => addChildField(field.id)} title="Add child field">+</button>
            )}
            <button className="btn-icon btn-danger" onClick={() => removeField(field.id)} title="Remove field">×</button>
          </div>
        </div>
        {hasChildren && field.children?.map(child => renderField(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JSON Schema Generator</h2>
        <p className="tool-desc">Build JSON Schema (Draft 7) visually with support for nested objects, arrays, enums, and validation rules</p>
      </div>

      <div className="generator-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Schema Builder</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
              <button onClick={validateSchema} className="btn-secondary">Validate</button>
            </div>
          </div>

          <div className="schema-meta">
            <div className="meta-field">
              <label>Title</label>
              <input type="text" value={schemaTitle} onChange={e => setSchemaTitle(e.target.value)} />
            </div>
            <div className="meta-field">
              <label>Version</label>
              <input type="text" value={schemaVersion} onChange={e => setSchemaVersion(e.target.value)} />
            </div>
            <div className="meta-field full-width">
              <label>Description</label>
              <textarea value={schemaDescription} onChange={e => setSchemaDescription(e.target.value)} rows={2} placeholder="Schema description..." />
            </div>
          </div>

          <div className="fields-header">
            <span className="col-name">Name</span>
            <span className="col-type">Type</span>
            <span className="col-req">Req</span>
            <span className="col-desc">Description</span>
            <span className="col-constraints">Constraints</span>
            <span className="col-actions">Actions</span>
          </div>

          <div className="fields-list">
            {fields.map(field => renderField(field))}
          </div>

          <button onClick={() => addField()} className="btn-add-field">+ Add Root Field</button>
        </div>

        <div className="controls-panel">
          <div className="format-selector">
            <label>Output Format</label>
            <div className="format-buttons">
              <button className={outputFormat === 'json' ? 'active' : ''} onClick={() => setOutputFormat('json')}>JSON</button>
              <button className={outputFormat === 'yaml' ? 'active' : ''} onClick={() => setOutputFormat('yaml')}>YAML</button>
            </div>
          </div>

          <div className="output-section">
            <div className="output-toolbar">
              <h3>Generated Schema ({outputFormat.toUpperCase()})</h3>
              <div className="output-actions">
                <button onClick={copyOutput} className={copied ? 'copied' : ''}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
                <button onClick={downloadSchema} className="btn-secondary">Download</button>
              </div>
            </div>
            <pre className="schema-output"><code>{output}</code></pre>
            {error && <div className="error-banner">✗ {error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple YAML dumper for basic objects
function jsYamlDump(obj: any, indent = 0): string {
  const spaces = '  '.repeat(indent);
  if (obj === null) return 'null';
  if (obj === undefined) return '';
  if (typeof obj === 'string') return obj.includes('\n') || obj.includes(':') ? `"${obj}"` : obj;
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => `${spaces}- ${jsYamlDump(item, indent + 1).trimStart()}`).join('\n');
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';
    return entries.map(([key, value]) => {
      const valStr = jsYamlDump(value, indent + 1);
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return `${spaces}${key}:\n${valStr}`;
      }
      return `${spaces}${key}: ${valStr}`;
    }).join('\n');
  }
  return String(obj);
}