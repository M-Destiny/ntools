# Component Generator

A powerful React component generator that creates production-ready components with multiple architectural patterns, TypeScript support, and modern best practices.

## Features

- **8 Component Patterns** - Choose from different architectural approaches
- **TypeScript Support** - Full type definitions with interfaces
- **Customizable Props** - Add, remove, and configure props with types, defaults, and requirements
- **Modern Options** - Toggle TypeScript, arrow functions, forwardRef, React.memo, destructuring, comments
- **Code Export** - Copy generated code instantly
- **Zero Dependencies** - Runs entirely in the browser

## Available Patterns

| Pattern | Description | Use Case |
|---------|-------------|----------|
| **Basic Component** | Simple functional component with props | Most components |
| **Compound Component** | Parent with sub-components (Select, Option) | Complex UI like Select, Tabs, Menu |
| **HOC Pattern** | Higher-order component wrapper | Cross-cutting concerns (auth, logging) |
| **Render Props** | Component using render prop pattern | Flexible rendering, state sharing |
| **Custom Hook + Component** | Logic extracted to reusable hook | Complex stateful logic |
| **Forward Ref** | Component with forwarded ref | DOM access, focus management |
| **Styled Components** | CSS-in-JS with styled-components | Dynamic styling, theming |
| **Tailwind CSS** | Utility-first CSS classes | Rapid styling, design systems |

## Configuration Options

| Option | Description |
|--------|-------------|
| **TypeScript** | Generate TypeScript interfaces and types |
| **Arrow Function** | Use `const Component = () => {}` syntax |
| **Forward Ref** | Wrap with `React.forwardRef` |
| **React.memo** | Memoize component for performance |
| **Destructure Props** | Destructure props in function parameters |
| **Add Comments** | Include JSDoc comments |
| **Use Interface** | Define Props as interface vs inline |

## Prop Types Supported

- Primitive: `string`, `number`, `boolean`
- React: `ReactNode`, `ReactElement`
- Functions: `() => void`, `(value: string) => void`, event handlers
- Complex: `object`, `array`, `Record<string, unknown>`, `string[]`, `number[]`

## Usage

1. Enter a component name (PascalCase)
2. Select a template pattern
3. Configure options (TypeScript, memo, forwardRef, etc.)
4. Add/configure props with names, types, defaults, and required flags
5. Copy the generated code

## Example Output

### Basic Component (TypeScript + Arrow + Memo)
```typescript
/** 
 * Button - Simple functional component with props
 */
interface ButtonProps {
  title: string;
  onClick?: () => void;
}

const Button = React.memo(({ title, onClick }: ButtonProps) => {
  return (
    <div className="button">
      {/* Button content */}
    </div>
  );
});

export default Button;
```

### Compound Component
```typescript
interface SelectProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectOptionProps {
  children: React.ReactNode;
  className?: string;
  value: string;
}

const SelectOption = ({ children, className, value }: SelectOptionProps) => {
  return <div className={`select__option ${className || ''}`} data-value={value}>{children}</div>;
};

const Select = ({ children, ...rest }: SelectProps) => {
  return <div className="select" {...rest}>{children}</div>;
};

Select.Option = SelectOption;

export default Select;
```

### Tailwind Button
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Button = ({ 
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-slate-600 text-white hover:bg-slate-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50'
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
```

## File Structure

```
component-generator/
├── index.tsx    # Main React component with all generators
└── README.md    # This file
```

## Technical Details

- Built with React + TypeScript
- All generation logic runs client-side
- No build step required - copy and paste directly
- Follows React 18+ best practices
- Compatible with Next.js, Vite, CRA, and other React frameworks