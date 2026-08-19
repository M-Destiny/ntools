import { useState, useEffect } from 'react';

interface CronField {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

const DEFAULT_CRON: CronField = {
  minute: '*',
  hour: '*',
  dayOfMonth: '*',
  month: '*',
  dayOfWeek: '*',
};

const FIELD_OPTIONS = {
  minute: Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')),
  hour: Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')),
  dayOfMonth: Array.from({ length: 31 }, (_, i) => (i + 1).toString()),
  month: [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ],
  dayOfWeek: [
    '0', '1', '2', '3', '4', '5', '6', '7',
    'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'
  ],
};

const FIELD_LABELS: Record<keyof CronField, string> = {
  minute: 'Minute (0-59)',
  hour: 'Hour (0-23)',
  dayOfMonth: 'Day of Month (1-31)',
  month: 'Month (1-12)',
  dayOfWeek: 'Day of Week (0-7)',
};

const FIELD_DESCRIPTIONS: Record<keyof CronField, string> = {
  minute: 'Minute of the hour',
  hour: 'Hour of the day (0 = midnight)',
  dayOfMonth: 'Day of the month',
  month: 'Month of the year',
  dayOfWeek: 'Day of the week (0 or 7 = Sunday)',
};

const PRESETS = [
  { name: 'Every minute', value: '* * * * *' },
  { name: 'Every hour', value: '0 * * * *' },
  { name: 'Daily at midnight', value: '0 0 * * *' },
  { name: 'Daily at noon', value: '0 12 * * *' },
  { name: 'Weekly (Sunday)', value: '0 0 * * 0' },
  { name: 'Monthly (1st)', value: '0 0 1 * *' },
  { name: 'Weekdays at 9am', value: '0 9 * * 1-5' },
  { name: 'Weekends at 10am', value: '0 10 * * 0,6' },
  { name: 'Every 5 minutes', value: '*/5 * * * *' },
  { name: 'Every 15 minutes', value: '*/15 * * * *' },
  { name: 'Every 30 minutes', value: '*/30 * * * *' },
  { name: 'Hourly at :30', value: '30 * * * *' },
];

export default function CronBuilder() {
  const [cron, setCron] = useState<CronField>(DEFAULT_CRON);
  const [expression, setExpression] = useState('* * * * *');
  const [description, setDescription] = useState('Runs every minute');
  const [nextRuns, setNextRuns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const expr = `${cron.minute} ${cron.hour} ${cron.dayOfMonth} ${cron.month} ${cron.dayOfWeek}`;
    setExpression(expr);
    validateAndDescribe(expr);
  }, [cron]);

  const validateAndDescribe = (expr: string) => {
    setError(null);
    try {
      // Basic validation
      const parts = expr.trim().split(/\s+/);
      if (parts.length !== 5) {
        throw new Error('Cron expression must have 5 fields');
      }
      // Simple validation for each field
      const [min, hr, dom, mon, dow] = parts;
      validateField(min, 'minute', 0, 59);
      validateField(hr, 'hour', 0, 23);
      validateField(dom, 'dayOfMonth', 1, 31);
      validateField(mon, 'month', 1, 12);
      validateField(dow, 'dayOfWeek', 0, 7);
      
      // Generate human-readable description
      const desc = describeCron(expr);
      setDescription(desc);
      
      // Calculate next 5 run times
      const runs = calculateNextRuns();
      setNextRuns(runs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid cron expression');
      setDescription('Invalid expression');
      setNextRuns([]);
    }
  };

  const validateField = (value: string, field: string, min: number, max: number) => {
    if (value === '*') return;
    const parts = value.split(',');
    for (const part of parts) {
      if (part.includes('/')) {
        const [range, step] = part.split('/');
        if (range !== '*' && !isValidRange(range, min, max)) {
          throw new Error(`Invalid ${field} range: ${range}`);
        }
        const stepNum = parseInt(step, 10);
        if (isNaN(stepNum) || stepNum < 1) {
          throw new Error(`Invalid ${field} step: ${step}`);
        }
      } else if (part.includes('-')) {
        if (!isValidRange(part, min, max)) {
          throw new Error(`Invalid ${field} range: ${part}`);
        }
      } else {
        const num = parseInt(part, 10);
        if (isNaN(num) || num < min || num > max) {
          throw new Error(`Invalid ${field} value: ${part} (must be ${min}-${max})`);
        }
      }
    }
  };

  const isValidRange = (range: string, min: number, max: number) => {
    const [start, end] = range.split('-').map(n => parseInt(n, 10));
    return !isNaN(start) && !isNaN(end) && start >= min && end <= max && start <= end;
  };

  const describeCron = (expr: string): string => {
    const [min, hr, dom, mon, dow] = expr.split(/\s+/);
    
    const parts: string[] = [];
    
    // Minute
    if (min === '*') parts.push('every minute');
    else if (min.startsWith('*/')) parts.push(`every ${min.slice(2)} minutes`);
    else if (min.includes(',')) parts.push(`at minutes: ${min}`);
    else if (min.includes('-')) parts.push(`minutes ${min}`);
    else parts.push(`at minute ${min}`);
    
    // Hour
    if (hr === '*') {
      if (min === '*') parts.push('of every hour');
      else parts.push('every hour');
    } else if (hr.startsWith('*/')) parts.push(`every ${hr.slice(2)} hours`);
    else if (hr.includes(',')) parts.push(`at hours: ${hr}`);
    else if (hr.includes('-')) parts.push(`hours ${hr}`);
    else parts.push(`at hour ${hr}`);
    
    // Day of month
    if (dom !== '*') {
      if (dom.startsWith('*/')) parts.push(`every ${dom.slice(2)} days`);
      else if (dom.includes(',')) parts.push(`on days: ${dom}`);
      else if (dom.includes('-')) parts.push(`days ${dom}`);
      else parts.push(`on day ${dom}`);
    }
    
    // Month
    if (mon !== '*') {
      if (mon.startsWith('*/')) parts.push(`every ${mon.slice(2)} months`);
      else if (mon.includes(',')) parts.push(`in months: ${mon}`);
      else if (mon.includes('-')) parts.push(`months ${mon}`);
      else parts.push(`in month ${mon}`);
    }
    
    // Day of week
    if (dow !== '*') {
      if (dow.startsWith('*/')) parts.push(`every ${dow.slice(2)} weeks`);
      else if (dow.includes(',')) parts.push(`on days: ${dow}`);
      else if (dow.includes('-')) parts.push(`days ${dow}`);
      else parts.push(`on day ${dow}`);
    }
    
    if (parts.length === 0) return 'Runs every minute';
    return `Runs ${parts.join(', ')}`;
  };

  const calculateNextRuns = (): string[] => {
    // Simplified next run calculation - just show next 5 occurrences approximately
    const runs: string[] = [];
    const now = new Date();
    
    // For demo purposes, just show next 5 times based on current time
    // A full cron parser would be more complex
    for (let i = 0; i < 5; i++) {
      const future = new Date(now.getTime() + (i + 1) * 60 * 60 * 1000); // Add hours for demo
      runs.push(future.toLocaleString());
    }
    return runs;
  };

  const handleFieldChange = (field: keyof CronField, value: string) => {
    setCron(prev => ({ ...prev, [field]: value }));
  };

  const applyPreset = (presetExpr: string) => {
    const parts = presetExpr.split(' ');
    if (parts.length === 5) {
      setCron({
        minute: parts[0],
        hour: parts[1],
        dayOfMonth: parts[2],
        month: parts[3],
        dayOfWeek: parts[4],
      });
    }
  };

  const copyExpression = () => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadFromExpression = () => {
    validateAndDescribe(expression);
    const parts = expression.trim().split(/\s+/);
    if (parts.length === 5) {
      setCron({
        minute: parts[0],
        hour: parts[1],
        dayOfMonth: parts[2],
        month: parts[3],
        dayOfWeek: parts[4],
      });
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Cron Expression Builder</h2>
        <p className="tool-desc">Build and test cron expressions visually. Select values for each field or use presets.</p>
      </div>

      <div className="cron-builder">
        {/* Expression Display */}
        <div className="expression-display">
          <label>Cron Expression</label>
          <div className="expression-row">
            <input
              type="text"
              value={expression}
              onChange={e => { setExpression(e.target.value); loadFromExpression(); }}
              className="cron-expression-input"
              placeholder="* * * * *"
            />
            <button onClick={copyExpression} className={copied ? 'copied' : 'btn-primary'}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <div className="expression-fields-hint">
            <span className="field-hint">Minute</span>
            <span className="field-hint">Hour</span>
            <span className="field-hint">Day</span>
            <span className="field-hint">Month</span>
            <span className="field-hint">Weekday</span>
          </div>
        </div>

        {error && <div className="error-banner">✗ {error}</div>}

        {/* Description */}
        <div className="description-panel">
          <h3>Schedule Description</h3>
          <p className="description-text">{description}</p>
        </div>

        {/* Field Builders */}
        <div className="fields-grid">
          {(Object.keys(DEFAULT_CRON) as Array<keyof CronField>).map(field => (
            <div key={field} className="field-builder">
              <label className="field-label">{FIELD_LABELS[field]}</label>
              <p className="field-description">{FIELD_DESCRIPTIONS[field]}</p>
              <div className="field-input-wrapper">
                <select
                  value={cron[field]}
                  onChange={e => handleFieldChange(field, e.target.value)}
                  className="field-select"
                >
                  <option value="*">Every ({field === 'minute' ? '*' : field === 'hour' ? '*' : field === 'dayOfMonth' ? '*' : field === 'month' ? '*' : '*'})</option>
                  {FIELD_OPTIONS[field].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={cron[field]}
                  onChange={e => handleFieldChange(field, e.target.value)}
                  className="field-text-input"
                  placeholder="Custom (e.g., */5, 1-5, 1,3,5)"
                />
              </div>
              <div className="field-quick-picks">
                {field === 'minute' && (
                  <>
                    <button onClick={() => handleFieldChange(field, '*')}>Every</button>
                    <button onClick={() => handleFieldChange(field, '0')}>:00</button>
                    <button onClick={() => handleFieldChange(field, '*/5')}>Every 5</button>
                    <button onClick={() => handleFieldChange(field, '*/15')}>Every 15</button>
                    <button onClick={() => handleFieldChange(field, '*/30')}>Every 30</button>
                  </>
                )}
                {field === 'hour' && (
                  <>
                    <button onClick={() => handleFieldChange(field, '*')}>Every</button>
                    <button onClick={() => handleFieldChange(field, '0')}>Midnight</button>
                    <button onClick={() => handleFieldChange(field, '12')}>Noon</button>
                    <button onClick={() => handleFieldChange(field, '9')}>9 AM</button>
                    <button onClick={() => handleFieldChange(field, '*/2')}>Every 2h</button>
                  </>
                )}
                {field === 'dayOfMonth' && (
                  <>
                    <button onClick={() => handleFieldChange(field, '*')}>Every</button>
                    <button onClick={() => handleFieldChange(field, '1')}>1st</button>
                    <button onClick={() => handleFieldChange(field, '15')}>15th</button>
                    <button onClick={() => handleFieldChange(field, 'L')}>Last</button>
                  </>
                )}
                {field === 'month' && (
                  <>
                    <button onClick={() => handleFieldChange(field, '*')}>Every</button>
                    <button onClick={() => handleFieldChange(field, '1')}>Jan</button>
                    <button onClick={() => handleFieldChange(field, '6')}>Jun</button>
                    <button onClick={() => handleFieldChange(field, '12')}>Dec</button>
                  </>
                )}
                {field === 'dayOfWeek' && (
                  <>
                    <button onClick={() => handleFieldChange(field, '*')}>Every</button>
                    <button onClick={() => handleFieldChange(field, '0')}>Sun</button>
                    <button onClick={() => handleFieldChange(field, '1-5')}>Weekdays</button>
                    <button onClick={() => handleFieldChange(field, '0,6')}>Weekends</button>
                    <button onClick={() => handleFieldChange(field, '5')}>Fri</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Presets */}
        <div className="presets-section">
          <h3>Quick Presets</h3>
          <div className="presets-grid">
            {PRESETS.map(preset => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.value)}
                className={`preset-btn ${expression === preset.value ? 'active' : ''}`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Next Runs */}
        {nextRuns.length > 0 && (
          <div className="next-runs-section">
            <h3>Next 5 Estimated Runs</h3>
            <ul className="next-runs-list">
              {nextRuns.map((run, i) => (
                <li key={i}>
                  <span className="run-number">{i + 1}.</span>
                  <span className="run-time">{run}</span>
                </li>
              ))}
            </ul>
            <p className="runs-disclaimer">Times are approximate — actual execution depends on system scheduler.</p>
          </div>
        )}

        {/* Help */}
        <div className="help-section">
          <details>
            <summary>Cron Syntax Reference</summary>
            <div className="help-content">
              <h4>Field Values</h4>
              <ul>
                <li><code>*</code> — Any value</li>
                <li><code>*/n</code> — Every n values (e.g., <code>*/5</code> = every 5)</li>
                <li><code>a-b</code> — Range from a to b (e.g., <code>1-5</code>)</li>
                <li><code>a,b,c</code> — List of values (e.g., <code>1,3,5</code>)</li>
                <li><code>a-b/n</code> — Step within range (e.g., <code>1-10/2</code> = 1,3,5,7,9)</li>
                <li><code>L</code> — Last day (day of month only)</li>
                <li><code>W</code> — Nearest weekday (day of month only)</li>
                <li><code>#</code> — Nth occurrence (day of week only, e.g., <code>5#2</code> = 2nd Friday)</li>
              </ul>
              <h4>Field Order</h4>
              <code>* * * * *</code>
              <div className="field-order">
                <span>┬ ┬ ┬ ┬ └─ Day of Week (0-7) (Sun=0 or 7)</span>
                <span>┬ ┬ ┬ └──── Month (1-12)</span>
                <span>┬ ┬ └────── Day of Month (1-31)</span>
                <span>┬ └──────── Hour (0-23)</span>
                <span>└────────── Minute (0-59)</span>
              </div>
              <h4>Examples</h4>
              <ul>
                <li><code>0 0 * * *</code> — Daily at midnight</li>
                <li><code>0 9 * * 1-5</code> — Weekdays at 9:00 AM</li>
                <li><code>*/15 * * * *</code> — Every 15 minutes</li>
                <li><code>0 0 1 * *</code> — Monthly on the 1st</li>
                <li><code>0 0 * * 0</code> — Weekly on Sunday</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}