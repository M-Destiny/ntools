import { useState } from 'react';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export default function OpenAPIValidator() {
  const [specInput, setSpecInput] = useState('');
  const [format, setFormat] = useState<'json' | 'yaml'>('json');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const validateSpec = async () => {
    if (!specInput.trim()) {
      setToast({ message: 'Please enter an OpenAPI specification', type: 'error' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let spec: any;
      if (format === 'json') {
        spec = JSON.parse(specInput);
      } else {
        // Simple YAML parsing - in production would use js-yaml
        spec = parseYAML(specInput);
      }

      const validation = validateOpenAPI(spec);
      setResult(validation);
      setToast({
        message: validation.valid ? 'Specification is valid!' : `Found ${validation.errors.length} error(s)`,
        type: validation.valid ? 'success' : 'error'
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Parse error';
      setResult({ valid: false, errors: [error], warnings: [] });
      setToast({ message: `Parse error: ${error}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const parseYAML = (yaml: string): any => {
    // Basic YAML parser for demo - in production use js-yaml
    const lines = yaml.split('\n');
    const result: any = {};
    let currentObj = result;
    const stack: any[] = [result];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const indent = line.length - line.trimStart().length;
      while (stack.length > indent / 2 + 1) stack.pop();

      const match = trimmed.match(/^(\w+):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        currentObj = stack[stack.length - 1];
        if (value === '' || value === '|') {
          currentObj[key] = {};
          stack.push(currentObj[key]);
        } else {
          currentObj[key] = value.replace(/^["']|["']$/g, '');
        }
      }
    }
    return result;
  };

  const validateOpenAPI = (spec: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!spec) {
      errors.push('Empty specification');
      return { valid: false, errors, warnings };
    }

    // Check OpenAPI version
    if (!spec.openapi && !spec.swagger) {
      errors.push('Missing "openapi" or "swagger" field');
    } else if (spec.openapi && !spec.openapi.startsWith('3.')) {
      warnings.push(`OpenAPI version ${spec.openapi} - validator optimized for 3.x`);
    }

    // Check info object
    if (!spec.info) {
      errors.push('Missing "info" object');
    } else {
      if (!spec.info.title) errors.push('info.title is required');
      if (!spec.info.version) errors.push('info.version is required');
    }

    // Check paths
    if (!spec.paths || Object.keys(spec.paths).length === 0) {
      errors.push('No paths defined');
    } else {
      for (const [path, methods] of Object.entries(spec.paths)) {
        if (typeof methods === 'object' && methods !== null) {
          for (const [method, op] of Object.entries(methods as any)) {
            if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'].includes(method)) {
              const operation = op as any;
              if (!operation.responses || Object.keys(operation.responses).length === 0) {
                warnings.push(`${method.toUpperCase()} ${path}: No responses defined`);
              }
              if (operation.parameters) {
                for (const param of operation.parameters) {
                  if (!param.name || !param.in) {
                    errors.push(`${method.toUpperCase()} ${path}: Parameter missing name or in`);
                  }
                }
              }
            }
          }
        }
      }
    }

    // Check components/schemas
    if (spec.components?.schemas) {
      for (const [name, schema] of Object.entries(spec.components.schemas)) {
        if (typeof schema === 'object' && schema !== null) {
          const s = schema as any;
          if (s.type === 'object' && !s.properties && !s.additionalProperties) {
            warnings.push(`Schema "${name}": object type without properties`);
          }
        }
      }
    }

    // Check servers
    if (!spec.servers || spec.servers.length === 0) {
      warnings.push('No servers defined - API base URL unknown');
    }

    // Check security
    if (spec.security && spec.security.length > 0) {
      if (!spec.components?.securitySchemes) {
        warnings.push('Security requirements defined but no securitySchemes in components');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setToast({ message: 'Result copied to clipboard', type: 'success' });
    }
  };

  const clearAll = () => {
    setSpecInput('');
    setResult(null);
  };

  const loadExample = () => {
    const example = {
      openapi: '3.0.3',
      info: {
        title: 'Sample API',
        version: '1.0.0',
        description: 'A sample OpenAPI specification'
      },
      servers: [
        { url: 'https://api.example.com/v1' }
      ],
      paths: {
        '/users': {
          get: {
            summary: 'List users',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/UserList' }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Create user',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserCreate' }
                }
              }
            },
            responses: {
              '201': { description: 'Created' }
            }
          }
        }
      },
      components: {
        schemas: {
          UserList: {
            type: 'object',
            properties: {
              users: { type: 'array', items: { $ref: '#/components/schemas/User' } }
            }
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' }
            }
          },
          UserCreate: {
            type: 'object',
            required: ['name', 'email'],
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' }
            }
          }
        }
      }
    };
    setSpecInput(JSON.stringify(example, null, 2));
    setFormat('json');
  };

  const Container = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>{children}</div>
  );

  const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>{children}</div>
  );

  const Button = ({ children, onClick, disabled, variant = 'primary', className = '' }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'destructive';
    className?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${className} ${
        variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50' :
        variant === 'secondary' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600' :
        'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
      }`}
    >
      {children}
    </button>
  );

  const Select = ({ value, onChange, options, label }: { 
    value: string; 
    onChange: (v: string) => void; 
    options: { value: string; label: string }[];
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const Textarea = ({ value, onChange, placeholder, rows = 10, label, fontFamily }: { 
    value: string; 
    onChange: (v: string) => void; 
    placeholder: string;
    rows?: number;
    label: string;
    fontFamily?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${fontFamily ? 'font-mono' : ''}`}
      />
    </div>
  );

  const ToastComponent = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-3 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
    </div>
  );

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">OpenAPI Validator</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Validate OpenAPI 3.x and Swagger 2.0 specifications. Checks structure, required fields, paths, components, and best practices.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <Select
            label="Format"
            value={format}
            onChange={(v: string) => setFormat(v as 'json' | 'yaml')}
            options={[
              { value: 'json', label: 'JSON' },
              { value: 'yaml', label: 'YAML' }
            ]}
          />
          <Textarea
            label="OpenAPI Specification"
            value={specInput}
            onChange={setSpecInput}
            placeholder="Paste your OpenAPI/Swagger spec here..."
            rows={25}
            fontFamily="monospace"
          />
          <div className="flex gap-3">
            <Button onClick={validateSpec} disabled={loading} className="flex-1">
              {loading ? 'Validating...' : 'Validate'}
            </Button>
            <Button onClick={loadExample} variant="secondary">
              Load Example
            </Button>
            <Button onClick={clearAll} variant="destructive">
              Clear
            </Button>
          </div>
        </Card>

        <Card className="space-y-4">
          {result && (
            <div className="space-y-4">
              <div className={`p-4 rounded-md border ${
                result.valid ? 'border-green-500/30 bg-green-500/10 dark:bg-green-900/20' : 'border-red-500/30 bg-red-500/10 dark:bg-red-900/20'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{result.valid ? '✓' : '✗'}</span>
                  <strong className={result.valid ? 'text-green-400' : 'text-red-400'}>
                    {result.valid ? 'Valid Specification' : 'Invalid Specification'}
                  </strong>
                </div>
                {result.errors.length > 0 && (
                  <div className="space-y-1 ml-6">
                    <strong className="text-red-400">Errors:</strong>
                    <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
                      {result.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.warnings.length > 0 && (
                  <div className="space-y-1 ml-6">
                    <strong className="text-yellow-400">Warnings:</strong>
                    <ul className="list-disc list-inside text-sm text-yellow-300 space-y-1">
                      {result.warnings.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={copyResult} variant="secondary">
                  Copy Result
                </Button>
              </div>
            </div>
          )}

          {!result && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <p className="text-lg mb-2">Enter a specification and click Validate</p>
              <p className="text-sm">Supports OpenAPI 3.x and Swagger 2.0 in JSON or YAML format</p>
            </div>
          )}

          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
            <h4 className="font-medium mb-2">Validation Checks:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>OpenAPI/Swagger version field</li>
              <li>Required info object (title, version)</li>
              <li>Paths and operations exist</li>
              <li>Response definitions for each operation</li>
              <li>Parameter structure validation</li>
              <li>Components/schemas basic structure</li>
              <li>Server definitions</li>
              <li>Security scheme references</li>
            </ul>
          </div>
        </Card>
      </div>

      {toast && (
        <ToastComponent
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Container>
  );
}