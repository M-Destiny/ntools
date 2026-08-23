import React, { useState, useCallback } from 'react';

interface Prop {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

interface Template {
  name: string;
  description: string;
  getCode: (props: Prop[], componentName: string, options: GeneratorOptions) => string;
}

interface GeneratorOptions {
  typescript: boolean;
  arrowFunction: boolean;
  forwardRef: boolean;
  memo: boolean;
  propsDestructuring: boolean;
  addComments: boolean;
  useInterface: boolean;
}

const PROP_TYPES = [
  'string',
  'number',
  'boolean',
  'ReactNode',
  'ReactElement',
  '() => void',
  '(value: string) => void',
  '(event: React.ChangeEvent<HTMLInputElement>) => void',
  '(event: React.MouseEvent<HTMLButtonElement>) => void',
  'object',
  'array',
  'Record<string, unknown>',
  'string[]',
  'number[]'
];

const TEMPLATES: Template[] = [
  {
    name: 'Basic Component',
    description: 'Simple functional component with props',
    getCode: (props, name, opts) => generateBasicComponent(props, name, opts)
  },
  {
    name: 'Compound Component',
    description: 'Component with sub-components (e.g., Select, Option)',
    getCode: (props, name, opts) => generateCompoundComponent(props, name, opts)
  },
  {
    name: 'HOC Pattern',
    description: 'Higher-order component wrapper',
    getCode: (props, name, opts) => generateHOCComponent(props, name, opts)
  },
  {
    name: 'Render Props',
    description: 'Component using render props pattern',
    getCode: (props, name, opts) => generateRenderPropsComponent(props, name, opts)
  },
  {
    name: 'Custom Hook + Component',
    description: 'Component with extracted custom hook logic',
    getCode: (props, name, opts) => generateHookComponent(props, name, opts)
  },
  {
    name: 'Forward Ref',
    description: 'Component with forwarded ref for DOM access',
    getCode: (props, name, opts) => generateForwardRefComponent(props, name, opts)
  },
  {
    name: 'Styled Component (CSS-in-JS)',
    description: 'Component with styled-components pattern',
    getCode: (props, name, opts) => generateStyledComponent(props, name, opts)
  },
  {
    name: 'Tailwind CSS',
    description: 'Component using Tailwind utility classes',
    getCode: (props, name, opts) => generateTailwindComponent(props, name, opts)
  }
];

function generateBasicComponent(props: Prop[], name: string, opts: GeneratorOptions): string {
  const lines: string[] = [];
  
  if (opts.addComments) {
    lines.push(`/**`);
    lines.push(` * ${name} - ${TEMPLATES[0].description}`);
    lines.push(` */`);
    lines.push('');
  }

  // Props type
  if (opts.useInterface && props.length > 0) {
    const interfaceName = opts.typescript ? `${name}Props` : '';
    lines.push(`interface ${interfaceName} {`);
    props.forEach(p => {
      const req = p.required ? '' : '?';
      lines.push(`  ${p.name}${req}: ${p.type};`);
    });
    lines.push('}');
    lines.push('');
  }

  const propsParam = opts.propsDestructuring 
    ? `{ ${props.map(p => `${p.name}${p.required ? '' : '?'}`).join(', ')} }`
    : 'props';

  const componentType = opts.typescript ? 'React.FC' : '';
  const generic = opts.typescript && opts.useInterface && props.length > 0 ? `<${name}Props>` : '';
  const arrow = opts.arrowFunction ? '= ' : '';
  const fnKeyword = opts.arrowFunction ? 'const' : 'function';
  const memoWrapper = opts.memo ? 'React.memo(' : '';
  const memoClose = opts.memo ? ')' : '';

  lines.push(`${memoWrapper}${fnKeyword} ${name}${generic} ${arrow}( ${propsParam} ) {`);
  
  if (!opts.propsDestructuring && props.length > 0) {
    const destructured = props.map(p => `  const { ${p.name} } = props;`).join('\n');
    lines.push(destructured);
    lines.push('');
  }

  // Default values
  const defaults = props.filter(p => p.defaultValue && !p.required);
  if (defaults.length > 0) {
    lines.push('  // Defaults');
    defaults.forEach(p => {
      lines.push(`  const ${p.name} = ${p.defaultValue};`);
    });
    lines.push('');
  }

  lines.push('  return (');
  lines.push(`    <div className="${name.toLowerCase()}">`);
  lines.push(`      {/* ${name} content */}`);
  lines.push('    </div>');
  lines.push('  );');
  lines.push('}');
  
  if (opts.memo) {
    lines.push(`${memoClose};`);
  }

  lines.push('');
  lines.push(`export default ${name};`);
  
  return lines.join('\n');
}

function generateCompoundComponent(props: Prop[], name: string, opts: GeneratorOptions): string {
  const lines: string[] = [];
  
  if (opts.addComments) {
    lines.push(`/**`);
    lines.push(` * ${name} - Compound component pattern`);
    lines.push(` */`);
    lines.push('');
  }

  if (opts.useInterface && props.length > 0) {
    lines.push(`interface ${name}Props {`);
    props.forEach(p => {
      const req = p.required ? '' : '?';
      lines.push(`  ${p.name}${req}: ${p.type};`);
    });
    lines.push('}');
    lines.push('');
  }

  // Sub-components
  const subComponents = ['Header', 'Body', 'Footer', 'Item'];
  
  subComponents.forEach(sub => {
    const subName = `${name}.${sub}`;
    lines.push(`interface ${subName}Props {`);
    lines.push(`  children: React.ReactNode;`);
    lines.push(`  className?: string;`);
    lines.push('}');
    lines.push('');
    
    const arrow = opts.arrowFunction ? '= ' : '';
    const fnKeyword = opts.arrowFunction ? 'const' : 'function';
    lines.push(`${fnKeyword} ${subName}${arrow}({ children, className }) {`);
    lines.push(`  return <div className={\`${name.toLowerCase()}__${sub.toLowerCase()} \${className || ''}\`}>{children}</div>;`);
    lines.push('}');
    lines.push('');
  });

  // Main component
  const propsParam = opts.propsDestructuring 
    ? `{ ${props.map(p => `${p.name}${p.required ? '' : '?'}`).join(', ')}, children }`
    : 'props';

  lines.push(`const ${name} = ${opts.arrowFunction ? '' : 'function '}(${propsParam}) {`);
  if (!opts.propsDestructuring) {
    lines.push('  const { children, ...rest } = props;');
  }
  lines.push('  return (');
  lines.push(`    <div className="${name.toLowerCase()}" {...rest}>`);
  lines.push('      {children}');
  lines.push('    </div>');
  lines.push('  );');
  lines.push('};');
  lines.push('');

  // Attach sub-components
  subComponents.forEach(sub => {
    lines.push(`${name}.${sub} = ${sub};`);
  });
  lines.push('');
  lines.push(`export default ${name};`);
  
  return lines.join('\n');
}

function generateHOCComponent(props: Prop[], name: string, opts: GeneratorOptions): string {
  const lines: string[] = [];
  
  if (opts.addComments) {
    lines.push(`/**`);
    lines.push(` * ${name} - Higher-Order Component pattern`);
    lines.push(` */`);
    lines.push('');
  }

  const wrappedComponentName = `Wrapped${name}`;
  
  if (opts.useInterface) {
    lines.push(`interface ${name}Props {`);
    props.forEach(p => {
      const req = p.required ? '' : '?';
      lines.push(`  ${p.name}${req}: ${p.type};`);
    });
    lines.push('}');
    lines.push('');
    lines.push(`interface ${wrappedComponentName}Props extends ${name}Props {`);
    lines.push('  // Additional injected props');
    lines.push('}');
    lines.push('');
  }

  const arrow = opts.arrowFunction ? '= ' : '';
  const fnKeyword = opts.arrowFunction ? 'const' : 'function';
  
  lines.push(`${fnKeyword} ${name} = ${arrow}(Component: React.ComponentType<any>) {`);
  lines.push(`  const HOC = ${opts.arrowFunction ? '' : 'function '}(props: any) {`);
  lines.push('    // Inject additional props/logic here');
  lines.push('    const injectedProps = {');
  lines.push('      // example: user: getCurrentUser()');
  lines.push('    };');
  lines.push('    return <Component {...props} {...injectedProps} />;');
  lines.push('  };');
  lines.push('');
  lines.push(`  HOC.displayName = \`with${name}(\${Component.displayName || Component.name || 'Component'})\`;`);
  lines.push('  return HOC;');
  lines.push('};');
  lines.push('');
  lines.push(`export default ${name};`);
  
  return lines.join('\n');
}

function generateRenderPropsComponent(props: Prop[], name: string, opts: GeneratorOptions): string {
  const lines: string[] = [];
  
  if (opts.addComments) {
    lines.push(`/**`);
    lines.push(` * ${name} - Render Props pattern`);
    lines.push(` */`);
    lines.push('');
  }

  if (opts.useInterface) {
    lines.push(`interface ${name}Props {`);
    props.forEach(p => {
      const req = p.required ? '' : '?';
      lines.push(`  ${p.name}${req}: ${p.type};`);
    });
    lines.push(`  render: (state: ${name}State) => React.ReactNode;`);
    lines.push('}');
    lines.push('');
    lines.push(`interface ${name}State {`);
    lines.push('  // Internal state exposed to render prop');
    lines.push('  data: any;');
    lines.push('  loading: boolean;');
    lines.push('  error: Error | null;');
    lines.push('}');
    lines.push('');
  }

  const arrow = opts.arrowFunction ? '= ' : '';
  const fnKeyword = opts.arrowFunction ? 'const' : 'function';
  
  lines.push(`${fnKeyword} ${name} = ${arrow}({ render, ...props }: ${opts.useInterface ? `${name}Props` : 'any'}) {`);
  lines.push('  const [state, setState] = React.useState({');
  lines.push('    data: null,');
  lines.push('    loading: true,');
  lines.push('    error: null');
  lines.push('  });');
  lines.push('');
  lines.push('  React.useEffect(() => {');
  lines.push('    // Fetch/load data');
  lines.push('    setState(s => ({ ...s, loading: false, data: "loaded" }));');
  lines.push('  }, []);');
  lines.push('');
  lines.push('  return <>{render(state)}</>;');
  lines.push('};');
  lines.push('');
  lines.push(`export default ${name};`);
  
  return lines.join('\n');
}

function generateHookComponent(props: Prop[], name: string, opts: GeneratorOptions): string {
  const lines: string[] = [];
  
  if (opts.addComments) {
    lines.push(`/**`);
    lines.push(` * ${name} - Custom Hook + Component pattern`);
    lines.push(` */`);
    lines.push('');
  }

  const hookName = `use${name}`;
  
  if (opts.useInterface) {
    lines.push(`interface ${name}Props {`);
    props.forEach(p => {
      const req = p.required ? '' : '?';
      lines.push(`  ${p.name}${req}: ${p.type};`);
    });
    lines.push('}');
    lines.push('');
    lines.push(`interface ${hookName}Return {`);
    lines.push('  // Hook return values');
    lines.push('  value: any;');
    lines.push('  setValue: (v: any) => void;');
    lines.push('}');
    lines.push('');
  }

  // Hook
  const arrow = opts.arrowFunction ? '= ' : '';
  const fnKeyword = opts.arrowFunction ? 'const' : 'function';
  
  lines.push(`${fnKeyword} ${hookName} = ${arrow}(initialValue: any) {`);
  lines.push('  const [value, setValue] = React.useState(initialValue);');
  lines.push('');
  lines.push('  // Add hook logic here');
  lines.push('');
  lines.push('  return { value, setValue };');
  lines.push('};');
  lines.push('');

  // Component
  lines.push(`${fnKeyword} ${name} = ${arrow}({ ${props.map(p => p.name).join(', ')} }: ${opts.useInterface ? `${name}Props` : 'any'}) {`);
  lines.push(`  const { value, setValue } = ${hookName}(${props[0]?.defaultValue || 'null'});`);
  lines.push('');
  lines.push('  return (');
  lines.push(`    <div className="${name.toLowerCase()}">`);
  lines.push('      {value}');
  lines.push('    </div>');
  lines.push('  );');
  lines.push('};');
  lines.push('');
  lines.push(`export { ${hookName} };`);
  lines.push(`export default ${name};`);
  
  return lines.join('\n');
}

function generateForwardRefComponent(props: Prop[], name: string, opts: GeneratorOptions): string {
  const lines: string[] = [];
  
  if (opts.addComments) {
    lines.push(`/**`);
    lines.push(` * ${name} - Forward Ref pattern`);
    lines.push(` */`);
    lines.push('');
  }

  if (opts.useInterface) {
    lines.push(`interface ${name}Props {`);
    props.forEach(p => {
      const req = p.required ? '' : '?';
      lines.push(`  ${p.name}${req}: ${p.type};`);
    });
    lines.push('}');
    lines.push('');
  }

  const refType = 'HTMLDivElement';
  const arrow = opts.arrowFunction ? '= ' : '';
  
  lines.push(`const ${name} = ${arrow}React.forwardRef<${refType}, ${opts.useInterface ? `${name}Props` : 'any'}>((props, ref) {`);
  
  if (opts.propsDestructuring) {
    lines.push(`  const { ${props.map(p => p.name).join(', ')} } = props;`);
  }
  
  lines.push('  return (');
  lines.push(`    <div ref={ref} className="${name.toLowerCase()}">`);
  lines.push('      {/* Component content */}');
  lines.push('    </div>');
  lines.push('  );');
  lines.push('});');
  lines.push('');
  lines.push(`${name}.displayName = '${name}';`);
  lines.push('');
  lines.push(`export default ${name};`);
  
  return lines.join('\n');
}

function generateStyledComponent(props: Prop[], name: string, opts: GeneratorOptions): string {
  const lines: string[] = [];
  
  if (opts.addComments) {
    lines.push(`/**`);
    lines.push(` * ${name} - Styled Components pattern`);
    lines.push(` */`);
    lines.push('');
  }

  lines.push(`import styled from 'styled-components';`);
  lines.push('');

  if (opts.useInterface) {
    lines.push(`interface ${name}Props {`);
    props.forEach(p => {
      const req = p.required ? '' : '?';
      lines.push(`  ${p.name}${req}: ${p.type};`);
    });
    lines.push(`  $variant?: 'primary' | 'secondary';`);
    lines.push(`  $size?: 'sm' | 'md' | 'lg';`);
    lines.push('}');
    lines.push('');
  }

  // Styled components
  lines.push(`const Styled${name} = styled.div<{ $variant?: string; $size?: string }>\`  `);
  lines.push(`  display: inline-flex;`);
  lines.push(`  align-items: center;`);
  lines.push(`  justify-content: center;`);
  lines.push(`  padding: \${props => {`);
  lines.push(`    switch (props.$size) {`);
  lines.push(`      case 'sm': return '4px 8px';`);
  lines.push(`      case 'lg': return '12px 24px';`);
  lines.push(`      default: return '8px 16px';`);
  lines.push(`    }}`);
  lines.push(`  }};`);
  lines.push(`  background: \${props => props.$variant === 'secondary' ? '#64748b' : '#667eea'};`);
  lines.push(`  color: white;`);
  lines.push(`  border-radius: 6px;`);
  lines.push(`  font-weight: 500;`);
  lines.push(`  transition: all 0.2s;`);
  lines.push(`  `);
  lines.push(`  &:hover {`);
  lines.push(`    opacity: 0.9;`);
  lines.push(`    transform: translateY(-1px);`);
  lines.push(`  }`);
  lines.push(`\`;`);
  lines.push('');

  const arrow = opts.arrowFunction ? '= ' : '';
  const fnKeyword = opts.arrowFunction ? 'const' : 'function';
  
  lines.push(`${fnKeyword} ${name} = ${arrow}({ ${props.map(p => p.name).join(', ')}, $variant, $size, ...rest }: ${opts.useInterface ? `${name}Props` : 'any'}) {`);
  lines.push('  return (');
  lines.push(`    <Styled${name} $variant={$variant} $size={$size} {...rest}>`);
  lines.push('      {children}');
  lines.push('    </Styled' + name + '>');
  lines.push('  );');
  lines.push('};');
  lines.push('');
  lines.push(`export default ${name};`);
  
  return lines.join('\n');
}

function generateTailwindComponent(props: Prop[], name: string, opts: GeneratorOptions): string {
  const lines: string[] = [];
  
  if (opts.addComments) {
    lines.push(`/**`);
    lines.push(` * ${name} - Tailwind CSS pattern`);
    lines.push(` */`);
    lines.push('');
  }

  if (opts.useInterface) {
    lines.push(`interface ${name}Props {`);
    props.forEach(p => {
      const req = p.required ? '' : '?';
      lines.push(`  ${p.name}${req}: ${p.type};`);
    });
    lines.push(`  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';`);
    lines.push(`  size?: 'sm' | 'md' | 'lg';`);
    lines.push(`  className?: string;`);
    lines.push('}');
    lines.push('');
  }

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-slate-600 text-white hover:bg-slate-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const arrow = opts.arrowFunction ? '= ' : '';
  const fnKeyword = opts.arrowFunction ? 'const' : 'function';
  
  lines.push(`${fnKeyword} ${name} = ${arrow}({`);
  lines.push(`  variant = 'primary',`);
  lines.push(`  size = 'md',`);
  lines.push(`  className = '',`);
  lines.push(`  children,`);
  lines.push(`  ...rest`);
  lines.push(`}: ${opts.useInterface ? `${name}Props` : 'any'}) {`);
  lines.push('');
  lines.push(`  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';`);
  lines.push('');
  lines.push(`  const variantStyles = {`);
  Object.entries(variantClasses).forEach(([k, v]) => {
    lines.push(`    ${k}: '${v}',`);
  });
  lines.push(`  };`);
  lines.push('');
  lines.push(`  const sizeStyles = {`);
  Object.entries(sizeClasses).forEach(([k, v]) => {
    lines.push(`    ${k}: '${v}',`);
  });
  lines.push(`  };`);
  lines.push('');
  lines.push(`  return (`);
  lines.push(`    <button`);
  lines.push(`      className={\`\${baseClasses} \${variantStyles[variant]} \${sizeStyles[size]} \${className}\`}`);
  lines.push(`      {...rest}`);
  lines.push(`    >`);
  lines.push(`      {children}`);
  lines.push(`    </button>`);
  lines.push(`  );`);
  lines.push('};');
  lines.push('');
  lines.push(`export default ${name};`);
  
  return lines.join('\n');
}

export default function ComponentGenerator() {
  const [componentName, setComponentName] = useState('MyComponent');
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [props, setProps] = useState<Prop[]>([
    { name: 'title', type: 'string', required: true, description: 'Component title' },
    { name: 'onClick', type: '() => void', required: false, description: 'Click handler' }
  ]);
  const [options, setOptions] = useState<GeneratorOptions>({
    typescript: true,
    arrowFunction: true,
    forwardRef: false,
    memo: false,
    propsDestructuring: true,
    addComments: true,
    useInterface: true
  });
  const [generatedCode, setGeneratedCode] = useState('');

  const generateCode = useCallback(() => {
    const code = template.getCode(props, componentName, options);
    setGeneratedCode(code);
  }, [template, props, componentName, options]);

  const addProp = () => {
    setProps([...props, { name: 'propName', type: 'string', required: false }]);
  };

  const removeProp = (index: number) => {
    setProps(props.filter((_, i) => i !== index));
  };

  const updateProp = (index: number, field: keyof Prop, value: string) => {
    setProps(props.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(generatedCode);
  };

  // Generate on mount and when key things change
  React.useEffect(() => {
    generateCode();
  }, [generateCode]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Component Generator</h1>
        <p style={styles.subtitle}>Generate React components with best practices</p>
      </div>

      <div style={styles.main}>
        {/* Configuration Panel */}
        <div style={styles.panel}>
          <div style={styles.section}>
            <label style={styles.label}>Component Name</label>
            <input
              style={styles.input}
              value={componentName}
              onChange={e => setComponentName(e.target.value)}
              placeholder="MyComponent"
            />
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Template Pattern</label>
            <select
              style={styles.select}
              value={template.name}
              onChange={e => setTemplate(TEMPLATES.find(t => t.name === e.target.value) || TEMPLATES[0])}
            >
              {TEMPLATES.map(t => (
                <option key={t.name} value={t.name}>{t.name}</option>
              ))}
            </select>
            <div style={styles.helper}>{template.description}</div>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Options</label>
            <div style={styles.optionsGrid}>
              {[
                { key: 'typescript', label: 'TypeScript', desc: 'Generate TS types' },
                { key: 'arrowFunction', label: 'Arrow Function', desc: 'Use const Component = () => {}' },
                { key: 'forwardRef', label: 'Forward Ref', desc: 'Add React.forwardRef' },
                { key: 'memo', label: 'React.memo', desc: 'Wrap with React.memo' },
                { key: 'propsDestructuring', label: 'Destructure Props', desc: 'Destructure in parameters' },
                { key: 'addComments', label: 'Add Comments', desc: 'Include JSDoc comments' },
                { key: 'useInterface', label: 'Use Interface', desc: 'Define Props interface' }
              ].map(opt => (
                <label key={opt.key} style={styles.option}>
                  <input
                    type="checkbox"
                    checked={options[opt.key as keyof GeneratorOptions]}
                    onChange={e => setOptions({ ...options, [opt.key]: e.target.checked })}
                  />
                  <div>
                    <span style={styles.optionLabel}>{opt.label}</span>
                    <div style={styles.optionDesc}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Props Editor */}
        <div style={styles.panel}>
          <div style={styles.sectionHeader}>
            <label style={styles.label}>Props</label>
            <button style={styles.addBtn} onClick={addProp}>+ Add Prop</button>
          </div>
          
          <div style={styles.propsList}>
            {props.map((prop, index) => (
              <div key={index} style={styles.propRow}>
                <input
                  style={{ ...styles.propInput, width: '120px' }}
                  value={prop.name}
                  onChange={e => updateProp(index, 'name', e.target.value)}
                  placeholder="propName"
                />
                <select
                  style={{ ...styles.propInput, width: '160px' }}
                  value={prop.type}
                  onChange={e => updateProp(index, 'type', e.target.value)}
                >
                  {PROP_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  style={{ ...styles.propInput, width: '100px' }}
                  value={prop.defaultValue || ''}
                  onChange={e => updateProp(index, 'defaultValue', e.target.value)}
                  placeholder="default"
                />
                <label style={styles.requiredLabel}>
                  <input
                    type="checkbox"
                    checked={prop.required}
                    onChange={e => updateProp(index, 'required', e.target.checked ? 'true' : 'false')}
                  />
                  Required
                </label>
                <button
                  style={styles.removeBtn}
                  onClick={() => removeProp(index)}
                  disabled={props.length === 1}
                  title="Remove prop"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Code */}
      <div style={styles.codePanel}>
        <div style={styles.codeHeader}>
          <h3 style={styles.codeTitle}>Generated Code</h3>
          <button style={styles.copyBtn} onClick={copyCode}>
            Copy to Clipboard
          </button>
        </div>
        <pre style={styles.codeBlock}>
          <code>{generatedCode || '// Configure options and props to generate code'}</code>
        </pre>
      </div>

      {/* Templates Info */}
      <div style={styles.infoPanel}>
        <h3 style={styles.infoTitle}>Available Patterns</h3>
        <div style={styles.infoGrid}>
          {TEMPLATES.map(t => (
            <div key={t.name} style={{ ...styles.infoCard, ...(template.name === t.name ? styles.infoCardActive : {}) }}>
              <h4 style={styles.infoCardTitle}>{t.name}</h4>
              <p style={styles.infoCardDesc}>{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    color: '#1a1a2e'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '16px'
  },
  main: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px'
  },
  panel: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0'
  },
  section: {
    marginBottom: '20px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    fontSize: '14px',
    color: '#334155'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    background: '#fff',
    cursor: 'pointer',
    outline: 'none'
  },
  helper: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#94a3b8'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  option: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    transition: 'background 0.2s'
  },
  optionLabel: {
    fontWeight: 500,
    fontSize: '13px',
    color: '#334155'
  },
  optionDesc: {
    fontSize: '11px',
    color: '#94a3b8'
  },
  propsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  propRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  propInput: {
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    outline: 'none',
    background: '#fff'
  },
  requiredLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#475569',
    cursor: 'pointer'
  },
  removeBtn: {
    padding: '4px 10px',
    borderRadius: '4px',
    border: 'none',
    background: '#fee2e2',
    color: '#dc2626',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    lineHeight: 1
  },
  addBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    background: '#667eea',
    color: '#fff',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '13px'
  },
  codePanel: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    marginBottom: '24px'
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  codeTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b'
  },
  copyBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    background: '#667eea',
    color: '#fff',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'background 0.2s'
  },
  codeBlock: {
    margin: 0,
    padding: '16px',
    background: '#0f172a',
    borderRadius: '8px',
    overflow: 'auto',
    fontSize: '13px',
    lineHeight: 1.6,
    color: '#e2e8f0',
    maxHeight: '500px'
  },
  infoPanel: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0'
  },
  infoTitle: {
    margin: '0 0 16px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '12px'
  },
  infoCard: {
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    transition: 'all 0.2s'
  },
  infoCardActive: {
    borderColor: '#667eea',
    background: '#f0f4ff'
  },
  infoCardTitle: {
    margin: '0 0 6px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b'
  },
  infoCardDesc: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b'
  }
};