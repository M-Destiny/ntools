import { useState, useEffect, useMemo } from 'react';

export default function UnixTimestamp() {
  const [timestamp, setTimestamp] = useState<string>('');
  const [dateInput, setDateInput] = useState<string>('');
  const [timezone, setTimezone] = useState<'utc' | 'local'>('local');
  const [copied, setCopied] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize with current timestamp
  useEffect(() => {
    if (!timestamp && !dateInput) {
      setTimestamp(Math.floor(Date.now() / 1000).toString());
    }
  }, []);

  const convertTimestamp = (ts: string) => {
    const num = parseInt(ts, 10);
    if (isNaN(num)) return null;
    
    // Handle both seconds and milliseconds
    const date = num > 1e11 ? new Date(num) : new Date(num * 1000);
    return date;
  };

  const convertDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const formatOutput = (date: Date) => {
    const isUTC = timezone === 'utc';
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    const getters = isUTC ? {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: date.getUTCSeconds(),
      ms: date.getUTCMilliseconds(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }),
      monthName: date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' }),
      tz: 'UTC',
      offset: '+00:00',
    } : {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      ms: date.getMilliseconds(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      monthName: date.toLocaleDateString('en-US', { month: 'long' }),
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      offset: `-${Math.abs(date.getTimezoneOffset() / 60).toString().padStart(2, '0')}:${Math.abs(date.getTimezoneOffset() % 60).toString().padStart(2, '0')}`,
    };

    const iso = isUTC ? date.toISOString() : date.toISOString().replace('Z', getters.offset);
    const rfc2822 = date.toUTCString();
    const unixSec = Math.floor(date.getTime() / 1000);
    const unixMs = date.getTime();
    const readable = `${getters.dayName}, ${getters.monthName} ${getters.day}, ${getters.year} ${pad(getters.hour)}:${pad(getters.minute)}:${pad(getters.second)} ${getters.tz}`;

    return {
      iso,
      rfc2822,
      readable,
      unixSec,
      unixMs,
      year: getters.year,
      month: getters.month,
      day: getters.day,
      hour: getters.hour,
      minute: getters.minute,
      second: getters.second,
      ms: getters.ms,
      dayName: getters.dayName,
      monthName: getters.monthName,
      tz: getters.tz,
      offset: getters.offset,
    };
  };

  const parsedFromTimestamp = useMemo(() => {
    if (!timestamp) return null;
    const date = convertTimestamp(timestamp);
    return date ? formatOutput(date) : null;
  }, [timestamp, timezone]);

  const parsedFromDate = useMemo(() => {
    if (!dateInput) return null;
    const date = convertDate(dateInput);
    return date ? formatOutput(date) : null;
  }, [dateInput, timezone]);

  const active = parsedFromTimestamp || parsedFromDate;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const setNow = () => {
    const now = Math.floor(Date.now() / 1000);
    setTimestamp(now.toString());
    setDateInput('');
  };

  const loadExample = (type: string) => {
    const examples: Record<string, { ts?: string; date?: string }> = {
      epoch: { ts: '0' },
      y2k: { ts: '946684800' },
      now: { ts: Math.floor(Date.now() / 1000).toString() },
      future: { ts: Math.floor((Date.now() + 86400000 * 365) / 1000).toString() },
      iso: { date: '2026-08-19T12:00:00Z' },
      rfc: { date: 'Wed, 19 Aug 2026 12:00:00 GMT' },
      us: { date: '08/19/2026 12:00:00' },
    };
    const ex = examples[type];
    if (ex) {
      if (ex.ts) setTimestamp(ex.ts);
      if (ex.date) setDateInput(ex.date);
    }
  };

  const copyAll = () => {
    if (!active) return;
    const output = `Unix Timestamp (seconds): ${active.unixSec}
Unix Timestamp (milliseconds): ${active.unixMs}
ISO 8601: ${active.iso}
RFC 2822: ${active.rfc2822}
Readable: ${active.readable}
Timezone: ${active.tz} (${active.offset})`;
    navigator.clipboard.writeText(output);
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Unix Timestamp Converter</h2>
        <p className="tool-desc">Convert between Unix timestamps (seconds/ms) and human-readable dates. Supports ISO 8601, RFC 2822, and custom formats.</p>
      </div>

      <div className="timestamp-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input</h3>
            <div className="toolbar-actions">
              <button onClick={setNow} className="btn-primary">Now</button>
              <button onClick={() => { setTimestamp(''); setDateInput(''); }} className="btn-secondary">Clear</button>
            </div>
          </div>

          <div className="input-tabs">
            <button 
              className={timestamp ? 'active' : ''} 
              onClick={() => { setDateInput(''); }}
            >
              Unix Timestamp
            </button>
            <button 
              className={dateInput ? 'active' : ''} 
              onClick={() => { setTimestamp(''); }}
            >
              Date String
            </button>
          </div>

          {timestamp && (
            <div className="control-group">
              <label>Unix Timestamp (seconds or milliseconds)</label>
              <input
                type="text"
                className="timestamp-input"
                value={timestamp}
                onChange={e => setTimestamp(e.target.value)}
                placeholder="e.g., 1724068800 or 1724068800000"
                spellCheck={false}
              />
              <div className="input-hint">
                Auto-detects seconds (10 digits) vs milliseconds (13 digits)
              </div>
            </div>
          )}

          {dateInput && (
            <div className="control-group">
              <label>Date String</label>
              <input
                type="text"
                className="date-input"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                placeholder="e.g., 2026-08-19T12:00:00Z, Aug 19 2026, 08/19/2026"
                spellCheck={false}
              />
              <div className="input-hint">
                Supports ISO 8601, RFC 2822, and common formats
              </div>
            </div>
          )}

          {!timestamp && !dateInput && (
            <div className="control-group">
              <label>Unix Timestamp (seconds or milliseconds)</label>
              <input
                type="text"
                className="timestamp-input"
                value={timestamp}
                onChange={e => setTimestamp(e.target.value)}
                placeholder="e.g., 1724068800 or 1724068800000"
                spellCheck={false}
              />
              <div className="input-hint">
                Or switch to Date String tab above
              </div>
            </div>
          )}

          <div className="control-group">
            <label>Timezone</label>
            <div className="timezone-toggle">
              <label>
                <input
                  type="radio"
                  name="timezone"
                  value="local"
                  checked={timezone === 'local'}
                  onChange={() => setTimezone('local')}
                />
                Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </label>
              <label>
                <input
                  type="radio"
                  name="timezone"
                  value="utc"
                  checked={timezone === 'utc'}
                  onChange={() => setTimezone('utc')}
                />
                UTC
              </label>
            </div>
          </div>

          <div className="examples-section">
            <h4>Quick Examples</h4>
            <div className="example-buttons">
              <button className="btn-example" onClick={() => loadExample('now')}>Now</button>
              <button className="btn-example" onClick={() => loadExample('epoch')}>Epoch (0)</button>
              <button className="btn-example" onClick={() => loadExample('y2k')}>Y2K</button>
              <button className="btn-example" onClick={() => loadExample('future')}>1 Year Later</button>
              <button className="btn-example" onClick={() => loadExample('iso')}>ISO 8601</button>
              <button className="btn-example" onClick={() => loadExample('rfc')}>RFC 2822</button>
              <button className="btn-example" onClick={() => loadExample('us')}>US Format</button>
            </div>
          </div>

          <div className="current-time">
            <h4>Current Time</h4>
            <div className="current-time-display">
              <div className="current-item">
                <span className="current-label">Unix (sec)</span>
                <code>{Math.floor(currentTime / 1000)}</code>
              </div>
              <div className="current-item">
                <span className="current-label">Unix (ms)</span>
                <code>{currentTime}</code>
              </div>
              <div className="current-item">
                <span className="current-label">ISO</span>
                <code>{new Date(currentTime).toISOString()}</code>
              </div>
            </div>
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-toolbar">
            <h3>Conversion Result</h3>
            <div className="preview-actions">
              <button onClick={copyAll} className={copied === 'all' ? 'copied' : 'btn-primary'} disabled={!active}>
                {copied === 'all' ? '✓ All Copied!' : 'Copy All'}
              </button>
            </div>
          </div>

          {active ? (
            <div className="result-grid">
              <div className="result-section">
                <h4>Timestamps</h4>
                <div className="result-row">
                  <span className="result-label">Unix (seconds)</span>
                  <div className="result-value-group">
                    <code>{active.unixSec}</code>
                    <button onClick={() => copyToClipboard(active.unixSec.toString(), 'unixSec')} className={copied === 'unixSec' ? 'copied' : 'btn-icon'} disabled={copied !== null} title="Copy">📋</button>
                  </div>
                </div>
                <div className="result-row">
                  <span className="result-label">Unix (milliseconds)</span>
                  <div className="result-value-group">
                    <code>{active.unixMs}</code>
                    <button onClick={() => copyToClipboard(active.unixMs.toString(), 'unixMs')} className={copied === 'unixMs' ? 'copied' : 'btn-icon'} disabled={copied !== null} title="Copy">📋</button>
                  </div>
                </div>
              </div>

              <div className="result-section">
                <h4>Formatted Dates</h4>
                <div className="result-row">
                  <span className="result-label">ISO 8601</span>
                  <div className="result-value-group">
                    <code>{active.iso}</code>
                    <button onClick={() => copyToClipboard(active.iso, 'iso')} className={copied === 'iso' ? 'copied' : 'btn-icon'} disabled={copied !== null} title="Copy">📋</button>
                  </div>
                </div>
                <div className="result-row">
                  <span className="result-label">RFC 2822</span>
                  <div className="result-value-group">
                    <code>{active.rfc2822}</code>
                    <button onClick={() => copyToClipboard(active.rfc2822, 'rfc2822')} className={copied === 'rfc2822' ? 'copied' : 'btn-icon'} disabled={copied !== null} title="Copy">📋</button>
                  </div>
                </div>
                <div className="result-row">
                  <span className="result-label">Readable</span>
                  <div className="result-value-group">
                    <code>{active.readable}</code>
                    <button onClick={() => copyToClipboard(active.readable, 'readable')} className={copied === 'readable' ? 'copied' : 'btn-icon'} disabled={copied !== null} title="Copy">📋</button>
                  </div>
                </div>
              </div>

              <div className="result-section">
                <h4>Components</h4>
                <div className="result-row">
                  <span className="result-label">Year</span>
                  <code>{active.year}</code>
                </div>
                <div className="result-row">
                  <span className="result-label">Month</span>
                  <code>{active.month} ({active.monthName})</code>
                </div>
                <div className="result-row">
                  <span className="result-label">Day</span>
                  <code>{active.day} ({active.dayName})</code>
                </div>
                <div className="result-row">
                  <span className="result-label">Time</span>
                  <code>{active.hour.toString().padStart(2, '0')}:{active.minute.toString().padStart(2, '0')}:{active.second.toString().padStart(2, '0')}.{active.ms.toString().padStart(3, '0')}</code>
                </div>
                <div className="result-row">
                  <span className="result-label">Timezone</span>
                  <code>{active.tz} ({active.offset})</code>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Enter a Unix timestamp or date string to see conversion results</p>
            </div>
          )}

          <div className="info-section">
            <details>
              <summary>Unix Timestamp Reference</summary>
              <div className="help-content">
                <h4>What is a Unix Timestamp?</h4>
                <p>The number of seconds that have elapsed since January 1, 1970 00:00:00 UTC (the Unix Epoch), not counting leap seconds.</p>
                
                <h4>Common Milestones</h4>
                <ul>
                  <li><code>0</code> — Jan 1, 1970 00:00:00 UTC (Epoch)</li>
                  <li><code>946684800</code> — Jan 1, 2000 00:00:00 UTC (Y2K)</li>
                  <li><code>1000000000</code> — Sep 9, 2001 01:46:40 UTC</li>
                  <li><code>2147483647</code> — Jan 19, 2038 03:14:07 UTC (32-bit limit)</li>
                </ul>

                <h4>Seconds vs Milliseconds</h4>
                <ul>
                  <li>JavaScript <code>Date.now()</code> returns milliseconds</li>
                  <li>Unix <code>time()</code> and most APIs use seconds</li>
                  <li>This tool auto-detects: 10 digits = seconds, 13 digits = milliseconds</li>
                </ul>

                <h4>Year 2038 Problem</h4>
                <p>32-bit signed integers overflow on January 19, 2038. Modern systems use 64-bit timestamps (good for ~292 billion years).</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}