import { useState, useMemo } from 'react';

export default function CronExpressionVisualizer() {
  const [expression, setExpression] = useState('0 0 * * *');
  const [error, setError] = useState<string | null>(null);
  const [nextRuns, setNextRuns] = useState<Date[]>([]);

  const cronParts = useMemo(() => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 6) return null;
    
    const [minute, hour, dayOfMonth, month, dayOfWeek, year] = parts;
    return { minute, hour, dayOfMonth, month, dayOfWeek, year: year || '*' };
  }, [expression]);

  const validateCron = (expr: string): boolean => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 6) return false;
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    const validateField = (field: string, min: number, max: number) => {
      if (field === '*') return true;
      const values = field.split(',');
      for (const v of values) {
        if (v.includes('/')) {
          const [range, step] = v.split('/');
          if (!validateField(range, min, max)) return false;
          const stepNum = parseInt(step, 10);
          if (isNaN(stepNum) || stepNum < 1 || stepNum > max) return false;
        } else if (v.includes('-')) {
          const [start, end] = v.split('-').map(Number);
          if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) return false;
        } else {
          const num = parseInt(v, 10);
          if (isNaN(num) || num < min || num > max) return false;
        }
      }
      return true;
    };

    return (
      validateField(minute, 0, 59) &&
      validateField(hour, 0, 23) &&
      validateField(dayOfMonth, 1, 31) &&
      validateField(month, 1, 12) &&
      validateField(dayOfWeek, 0, 7)
    );
  };

  const parseCronField = (field: string, min: number, max: number, names?: string[]): string => {
    if (field === '*') return `Every ${names ? 'value' : 'minute'}`;
    if (field.includes('/')) {
      const [range, step] = field.split('/');
      const base = range === '*' ? `every ${step} ${names ? 'values' : 'minutes'}` : parseCronField(range, min, max, names);
      return `Every ${step} ${names ? 'values' : 'minutes'} (${base})`;
    }
    if (field.includes(',')) {
      return field.split(',').map(v => parseCronField(v, min, max, names)).join(', ');
    }
    if (field.includes('-')) {
      const [start, end] = field.split('-');
      return `From ${names?.[parseInt(start)] || start} to ${names?.[parseInt(end)] || end}`;
    }
    const num = parseInt(field, 10);
    return names?.[num] || field;
  };

  const description = useMemo(() => {
    if (!cronParts || !validateCron(expression)) return null;
    
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const minuteDesc = parseCronField(cronParts.minute, 0, 59);
    const hourDesc = parseCronField(cronParts.hour, 0, 23);
    const dayOfMonthDesc = parseCronField(cronParts.dayOfMonth, 1, 31);
    const monthDesc = parseCronField(cronParts.month, 1, 12, monthNames);
    const dayOfWeekDesc = parseCronField(cronParts.dayOfWeek, 0, 7, dayNames);
    
    let desc = `At ${hourDesc}:${minuteDesc.padStart(2, '0')}`;
    if (cronParts.dayOfMonth !== '*') desc += ` on day ${dayOfMonthDesc} of the month`;
    if (cronParts.month !== '*') desc += ` in ${monthDesc}`;
    if (cronParts.dayOfWeek !== '*') desc += ` on ${dayOfWeekDesc}`;
    
    return desc;
  }, [cronParts, expression]);

  const calculateNextRuns = () => {
    if (!cronParts || !validateCron(expression)) return [];
    
    const runs: Date[] = [];
    let current = new Date();
    current.setSeconds(0, 0);
    
    // Simple next run calculation (find next 5 matching times)
    for (let i = 0; i < 5 && runs.length < 5; i++) {
      current = new Date(current.getTime() + 60000); // Add 1 minute
      // This is a simplified check - in production use a proper cron parser
      if (matchesCron(current, cronParts)) {
        runs.push(new Date(current));
      }
      // Safety limit
      if (i > 10000) break;
    }
    
    return runs;
  };

  const matchesCron = (date: Date, parts: any): boolean => {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();
    
    const matchField = (value: number, field: string, max: number) => {
      if (field === '*') return true;
      const values = field.split(',');
      for (const v of values) {
        if (v.includes('/')) {
          const [range, step] = v.split('/');
          if (range !== '*' && !matchField(value, range, max)) continue;
          return value % parseInt(step, 10) === 0;
        }
        if (v.includes('-')) {
          const [start, end] = v.split('-').map(Number);
          return value >= start && value <= end;
        }
        if (parseInt(v, 10) === value) return true;
      }
      return false;
    };
    
    return (
      matchField(minute, parts.minute, 59) &&
      matchField(hour, parts.hour, 23) &&
      matchField(dayOfMonth, parts.dayOfMonth, 31) &&
      matchField(month, parts.month, 12) &&
      matchField(dayOfWeek, parts.dayOfWeek, 7)
    );
  };

  const handleExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setExpression(val);
    setError(validateCron(val) ? null : 'Invalid cron expression');
    if (validateCron(val)) {
      setNextRuns(calculateNextRuns());
    }
  };

  const presets = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Daily at midnight', value: '0 0 * * *' },
    { label: 'Daily at noon', value: '0 12 * * *' },
    { label: 'Weekly (Sunday)', value: '0 0 * * 0' },
    { label: 'Monthly (1st)', value: '0 0 1 * *' },
    { label: 'Weekdays at 9am', value: '0 9 * * 1-5' },
    { label: 'Every 15 minutes', value: '*/15 * * * *' },
    { label: 'Every 5 minutes', value: '*/5 * * * *' },
  ];

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Cron Expression Visualizer</h2>
        <p className="tool-desc">Build, validate, and visualize cron expressions. See human-readable descriptions and next run times.</p>
      </div>

      <div className="tool-grid">
        <div className="editor-panel">
          <div className="input-group">
            <label htmlFor="cron-expression">Cron Expression</label>
            <input
              id="cron-expression"
              type="text"
              value={expression}
              onChange={handleExpressionChange}
              className={`cron-input ${error ? 'error' : ''}`}
              placeholder="0 0 * * *"
              spellCheck={false}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <div className="field-breakdown">
            <h3>Field Breakdown</h3>
            <div className="fields-grid">
              {cronParts && [
                { label: 'Minute', value: cronParts.minute, range: '0-59' },
                { label: 'Hour', value: cronParts.hour, range: '0-23' },
                { label: 'Day of Month', value: cronParts.dayOfMonth, range: '1-31' },
                { label: 'Month', value: cronParts.month, range: '1-12' },
                { label: 'Day of Week', value: cronParts.dayOfWeek, range: '0-7 (Sun=0,7)' },
                { label: 'Year (optional)', value: cronParts.year, range: 'empty or 1970-2099' },
              ].map((field, i) => (
                <div key={i} className="field-item">
                  <span className="field-label">{field.label}</span>
                  <span className="field-value">{field.value}</span>
                  <span className="field-range">{field.range}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="presets">
            <h3>Presets</h3>
            <div className="preset-buttons">
              {presets.map((preset, i) => (
                <button
                  key={i}
                  className={expression === preset.value ? 'active' : ''}
                  onClick={() => {
                    setExpression(preset.value);
                    setError(null);
                    setNextRuns(calculateNextRuns());
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="preview-panel">
          {description && (
            <div className="description-card">
              <h3>Human-Readable Description</h3>
              <p className="description-text">{description}</p>
            </div>
          )}

          <div className="next-runs-card">
            <h3>Next 5 Run Times</h3>
            {nextRuns.length > 0 ? (
              <ul className="next-runs-list">
                {nextRuns.map((run, i) => (
                  <li key={i}>
                    <span className="run-time">{run.toLocaleString()}</span>
                    <span className="run-relative">{getRelativeTime(run)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-runs">Enter a valid cron expression to see next run times</p>
            )}
          </div>

          <div className="cheatsheet">
            <h3>Quick Reference</h3>
            <div className="cheatsheet-grid">
              <div className="cheat-item"><code>*</code><span>Any value</span></div>
              <div className="cheat-item"><code>*/n</code><span>Every n values</span></div>
              <div className="cheat-item"><code>a-b</code><span>Range a to b</span></div>
              <div className="cheat-item"><code>a,b,c</code><span>Multiple values</span></div>
              <div className="cheat-item"><code>?</code><span>No specific value (day fields)</span></div>
              <div className="cheat-item"><code>L</code><span>Last day of month/week</span></div>
              <div className="cheat-item"><code>W</code><span>Nearest weekday</span></div>
              <div className="cheat-item"><code>#</code><span>Nth occurrence (day of week)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
}