import React from 'react';

// ============================================
// NTOOLS DESIGN SYSTEM - Design Tokens Only
// ============================================

// Color Palette (CSS Custom Properties as JS tokens)
export const colors = {
  // Primary
  primary: 'var(--color-primary)',
  primaryHover: 'var(--color-primary-hover)',
  primaryLight: 'var(--color-primary-light)',
  
  // Semantic
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  info: 'var(--color-info)',
  
  // Neutrals
  bg: 'var(--color-bg)',
  bgSecondary: 'var(--color-bg-secondary)',
  bgTeritiary: 'var(--color-bg-tertiary)',
  border: 'var(--color-border)',
  borderHover: 'var(--color-border-hover)',
  
  // Text
  text: 'var(--color-text)',
  textSecondary: 'var(--color-text-secondary)',
  textMuted: 'var(--color-text-muted)',
  textInverse: 'var(--color-text-inverse)',
  
  // Category colors
  catDesign: 'var(--color-cat-design)',
  catDesignBg: 'var(--color-cat-design-bg)',
  catDeveloper: 'var(--color-cat-developer)',
  catDeveloperBg: 'var(--color-cat-developer-bg)',
  catData: 'var(--color-cat-data)',
  catDataBg: 'var(--color-cat-data-bg)',
  catUtility: 'var(--color-cat-utility)',
  catUtilityBg: 'var(--color-cat-utility-bg)',
};

// Spacing (8px base grid) - all string keys
export const space = {
  '0': 'var(--space-0)',
  '1': 'var(--space-1)',
  '1.5': 'var(--space-1-5)',
  '2': 'var(--space-2)',
  '2.5': 'var(--space-2-5)',
  '3': 'var(--space-3)',
  '3.5': 'var(--space-3-5)',
  '4': 'var(--space-4)',
  '5': 'var(--space-5)',
  '6': 'var(--space-6)',
  '7': 'var(--space-7)',
  '8': 'var(--space-8)',
  '9': 'var(--space-9)',
  '10': 'var(--space-10)',
  '12': 'var(--space-12)',
  '14': 'var(--space-14)',
  '16': 'var(--space-16)',
  '20': 'var(--space-20)',
  '24': 'var(--space-24)',
};

// Typography
export const typography = {
  fontSans: 'var(--font-sans)',
  fontMono: 'var(--font-mono)',
  
  // Fluid type scale
  xs: 'var(--text-xs)',
  sm: 'var(--text-sm)',
  base: 'var(--text-base)',
  lg: 'var(--text-lg)',
  xl: 'var(--text-xl)',
  '2xl': 'var(--text-2xl)',
  '3xl': 'var(--text-3xl)',
  '4xl': 'var(--text-4xl)',
  
  fontNormal: 'var(--font-weight-normal)',
  fontMedium: 'var(--font-weight-medium)',
  fontSemibold: 'var(--font-weight-semibold)',
  fontBold: 'var(--font-weight-bold)',
  
  lineHeightTight: 'var(--leading-tight)',
  lineHeightNormal: 'var(--leading-normal)',
  lineHeightRelaxed: 'var(--leading-relaxed)',
};

// Border radius
export const radius = {
  none: 'var(--radius-none)',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  full: 'var(--radius-full)',
};

// Shadows
export const shadows = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  focus: 'var(--focus-ring)',
};

// Transitions
export const transitions = {
  fast: 'var(--transition-fast)',
  normal: 'var(--transition-normal)',
  slow: 'var(--transition-slow)',
};

// Z-index
export const zIndex = {
  dropdown: 'var(--z-dropdown)',
  modal: 'var(--z-modal)',
  popover: 'var(--z-popover)',
  tooltip: 'var(--z-tooltip)',
  toast: 'var(--z-toast)',
};

// Breakpoints
export const breakpoints = {
  sm: 'var(--bp-sm)',
  md: 'var(--bp-md)',
  lg: 'var(--bp-lg)',
  xl: 'var(--bp-xl)',
  '2xl': 'var(--bp-2xl)',
  '3xl': 'var(--bp-3xl)',
};

// Container widths
export const container = {
  maxWidth: 'var(--container-max)',
  padding: 'var(--container-pad)',
};

// ============================================
// CSS CLASS NAMES (for use with className prop)
// ============================================

export const cssClasses = {
  // Layout
  container: 'ds-container',
  grid: 'ds-grid',
  flex: 'ds-flex',
  flexCol: 'ds-flex-col',
  center: 'ds-center',
  
  // Typography
  heading1: 'ds-heading-1',
  heading2: 'ds-heading-2',
  heading3: 'ds-heading-3',
  heading4: 'ds-heading-4',
  body: 'ds-body',
  bodySmall: 'ds-body-small',
  caption: 'ds-caption',
  code: 'ds-code',
  codeBlock: 'ds-code-block',
  
  // Buttons
  btn: 'ds-btn',
  btnPrimary: 'ds-btn-primary',
  btnSecondary: 'ds-btn-secondary',
  btnGhost: 'ds-btn-ghost',
  btnDanger: 'ds-btn-danger',
  btnIcon: 'ds-btn-icon',
  btnSm: 'ds-btn-sm',
  btnLg: 'ds-btn-lg',
  
  // Inputs
  inputWrapper: 'ds-input-wrapper',
  input: 'ds-input',
  textarea: 'ds-textarea',
  select: 'ds-select',
  label: 'ds-label',
  helper: 'ds-helper',
  inputError: 'ds-input-error',
  
  // Cards
  card: 'ds-card',
  cardElevated: 'ds-card-elevated',
  cardInteractive: 'ds-card-interactive',
  cardPanel: 'ds-card-panel',
  
  // Badges
  badge: 'ds-badge',
  badgeDefault: 'ds-badge-default',
  badgePrimary: 'ds-badge-primary',
  badgeSuccess: 'ds-badge-success',
  badgeWarning: 'ds-badge-warning',
  badgeError: 'ds-badge-error',
  badgeDesign: 'ds-badge-design',
  badgeDeveloper: 'ds-badge-developer',
  badgeData: 'ds-badge-data',
  badgeUtility: 'ds-badge-utility',
  
  // Tool specific
  toolContainer: 'ds-tool-container',
  toolHeader: 'ds-tool-header',
  toolHeaderIcon: 'ds-tool-header-icon',
  toolHeaderContent: 'ds-tool-header-content',
  valueDisplay: 'ds-value-display',
  valueDisplayCode: 'ds-value-display-code',
  
  // Layout
  toolLayout: 'ds-tool-layout',
  toolSidebar: 'ds-tool-sidebar',
  toolContent: 'ds-tool-content',
  
  // Empty state
  emptyState: 'ds-empty-state',
  emptyStateIcon: 'ds-empty-state-icon',
  emptyStateAction: 'ds-empty-state-action',
  
  // Help
  helpSection: 'ds-help-section',
  helpSummary: 'ds-help-summary',
  helpContent: 'ds-help-content',
};

// ============================================
// REACT COMPONENT WRAPPERS (using CSS classes)
// ============================================

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  loading = false,
  className = '',
  style,
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: cssClasses.btnPrimary,
    secondary: cssClasses.btnSecondary,
    ghost: cssClasses.btnGhost,
    danger: cssClasses.btnDanger,
  }[variant];
  
  const sizeClass = {
    sm: cssClasses.btnSm,
    md: '',
    lg: cssClasses.btnLg,
  }[size] || '';
  
  const iconClass = iconOnly ? cssClasses.btnIcon : '';
  
  return (
    <button
      className={`${cssClasses.btn} ${variantClass} ${sizeClass} ${iconClass} ${className}`.trim()}
      style={style}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="ds-spinner"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="31.4 31.4"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Input({
  label,
  helperText,
  error,
  className = '',
  style,
  id,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  
  return (
    <div className={`${cssClasses.inputWrapper} ${className}`.trim()} style={style}>
      {label && (
        <label htmlFor={inputId} className={cssClasses.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${cssClasses.input} ${error ? cssClasses.inputError : ''}`.trim()}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className={`${cssClasses.helper} ds-helper-error`}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className={cssClasses.helper}>
          {helperText}
        </p>
      )}
    </div>
  );
}

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Textarea({
  label,
  helperText,
  error,
  className = '',
  style,
  id,
  ...props
}: TextareaProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  
  return (
    <div className={`${cssClasses.inputWrapper} ${className}`.trim()} style={style}>
      {label && (
        <label htmlFor={inputId} className={cssClasses.label}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`${cssClasses.textarea} ${cssClasses.input} ${error ? cssClasses.inputError : ''}`.trim()}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className={`${cssClasses.helper} ds-helper-error`}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className={cssClasses.helper}>
          {helperText}
        </p>
      )}
    </div>
  );
}

// Card Component
interface CardProps {
  variant?: 'base' | 'elevated' | 'interactive' | 'panel';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({
  variant = 'base',
  children,
  className = '',
  style,
  onClick,
}: CardProps) {
  const variantClass = {
    base: cssClasses.card,
    elevated: cssClasses.cardElevated,
    interactive: cssClasses.cardInteractive,
    panel: cssClasses.cardPanel,
  }[variant];
  
  return (
    <div
      className={`${variantClass} ${className}`.trim()}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}

// Badge Component
interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  category?: 'Design' | 'Developer' | 'Data' | 'Utility';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({
  variant = 'default',
  category,
  children,
  className = '',
  style,
}: BadgeProps) {
  const variantClass = category ? {
    Design: cssClasses.badgeDesign,
    Developer: cssClasses.badgeDeveloper,
    Data: cssClasses.badgeData,
    Utility: cssClasses.badgeUtility,
  }[category] : {
    default: cssClasses.badgeDefault,
    primary: cssClasses.badgePrimary,
    success: cssClasses.badgeSuccess,
    warning: cssClasses.badgeWarning,
    error: cssClasses.badgeError,
  }[variant];
  
  return (
    <span
      className={`${cssClasses.badge} ${variantClass} ${className}`.trim()}
      style={style}
    >
      {children}
    </span>
  );
}

// ToolHeader Component (consistent header for all tools)
interface ToolHeaderProps {
  title: string;
  description: string;
  category: 'Design' | 'Developer' | 'Data' | 'Utility';
  icon?: React.ReactNode;
}

export function ToolHeader({ title, description, category, icon }: ToolHeaderProps) {
  return (
    <header className={cssClasses.toolHeader}>
      <div className={cssClasses.toolHeaderContent}>
        <div className={cssClasses.toolHeaderIcon} style={{
          backgroundColor: colors[`cat${category}Bg` as keyof typeof colors],
          color: colors[`cat${category}` as keyof typeof colors],
        }}>
          {icon}
        </div>
        <div>
          <h1 className={cssClasses.heading2} style={{ margin: 0 }}>{title}</h1>
          <p className={cssClasses.bodySmall} style={{ margin: `${space['1']} 0 0 0` }}>{description}</p>
        </div>
      </div>
      <Badge category={category}>{category}</Badge>
    </header>
  );
}

// ValueDisplay Component (for showing formatted values)
interface ValueDisplayProps {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  format?: 'code' | 'text';
}

export function ValueDisplay({
  label,
  value,
  copyable = false,
  onCopy,
  copied = false,
  format = 'text',
}: ValueDisplayProps) {
  return (
    <div className={cssClasses.valueDisplay}>
      <label className={cssClasses.caption} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: space['2'],
        padding: `${space['2.5']} ${space['3.5']}`,
        backgroundColor: colors.bgTeritiary,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        minHeight: '44px',
      }}>
        <span className={format === 'code' ? cssClasses.valueDisplayCode : ''} style={{
          flex: 1,
          fontFamily: format === 'code' ? typography.fontMono : typography.fontSans,
          fontSize: typography.sm,
          color: colors.text,
          wordBreak: 'break-all',
        }}>
          {value}
        </span>
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={onCopy}
            aria-label={copied ? 'Copied' : 'Copy to clipboard'}
          >
            {copied ? '✓' : '📋'}
          </Button>
        )}
      </div>
    </div>
  );
}

// ToolLayout Component (standard layout for all tools)
interface ToolLayoutProps {
  children: React.ReactNode;
  header: ToolHeaderProps;
  sidebar?: React.ReactNode;
  fullWidth?: boolean;
}

export function ToolLayout({ children, header, sidebar, fullWidth = false }: ToolLayoutProps) {
  return (
    <div className={cssClasses.toolContainer}>
      <main className={cssClasses.toolLayout}>
        <ToolHeader {...header} />
        <div className={cssClasses.toolContent}>
          {sidebar && !fullWidth && (
            <aside className={cssClasses.toolSidebar}>
              {sidebar}
            </aside>
          )}
          <section style={{ minWidth: 0 }}>
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}

// EmptyState Component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={cssClasses.emptyState}>
      {icon && (
        <div className={cssClasses.emptyStateIcon}>
          {icon}
        </div>
      )}
      <h3 className={cssClasses.heading3} style={{ margin: 0, marginBottom: space['2'] }}>{title}</h3>
      <p className={cssClasses.body} style={{ color: colors.textSecondary, margin: 0, marginBottom: space['4'], maxWidth: '320px' }}>
        {description}
      </p>
      {action && (
        <div className={cssClasses.emptyStateAction}>
          {action}
        </div>
      )}
    </div>
  );
}

// HelpSection Component
interface HelpSectionProps {
  title: string;
  children: React.ReactNode;
}

export function HelpSection({ title, children }: HelpSectionProps) {
  return (
    <details className={cssClasses.helpSection}>
      <summary className={cssClasses.helpSummary}>
        {title}
      </summary>
      <div className={cssClasses.helpContent}>
        {children}
      </div>
    </details>
  );
}

// ============================================
// UTILITY HOOKS
// ============================================

// Copy to clipboard hook
export function useCopyToClipboard() {
  const [copied, setCopied] = React.useState<string | null>(null);
  
  const copy = React.useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);
  
  return { copied, copy };
}

// LocalStorage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  
  const setValue = React.useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue] as const;
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

// Media query hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);
  
  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  
  return matches;
}

// Reduced motion hook
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// ============================================
// EXPORT ALL
// ============================================

export const designTokens = {
  colors,
  space,
  typography,
  radius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  container,
  cssClasses,
};

export const components = {
  Button,
  Input,
  Textarea,
  Card,
  Badge,
  ToolHeader,
  ValueDisplay,
  ToolLayout,
  EmptyState,
  HelpSection,
};

export const hooks = {
  useCopyToClipboard,
  useLocalStorage,
  useDebounce,
  useMediaQuery,
  useReducedMotion,
};

export default {
  tokens: designTokens,
  components,
  hooks,
};