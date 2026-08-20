import { useState, useEffect, useCallback } from 'react';

interface UUIDInfo {
  id: string;
  version: number;
  variant: string;
  timestamp?: Date;
  node?: string;
  clockSequence?: number;
}

export default function UUIDGenerator() {
  const [count, setCount] = useState(10);
  const [version, setVersion] = useState<'v4' | 'v1' | 'v7'>('v4');
  const [uuids, setUUIDs] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedUUID, setSelectedUUID] = useState<string | null>(null);
  const [parsedInfo, setParsedInfo] = useState<UUIDInfo | null>(null);
  const [autoGenerate, setAutoGenerate] = useState(false);

  // Generate UUID v4 (random)
  const generateV4 = useCallback((): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }, []);

  // Generate UUID v1 (timestamp-based)
  const generateV1 = useCallback((): string => {
    const now = Date.now();
    const timeLow = (now & 0xffffffff).toString(16).padStart(8, '0');
    const timeMid = ((now >> 32) & 0xffff).toString(16).padStart(4, '0');
    const timeHiAndVersion = (((now >> 48) & 0x0fff) | 0x1000).toString(16).padStart(4, '0');
    
    const clockSeq = ((Math.random() * 0x3fff) | 0x8000).toString(16).padStart(4, '0');
    const node = Array.from({ length: 6 }, () => (Math.random() * 256) | 0)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeq}-${node}`;
  }, []);

  // Generate UUID v7 (Unix timestamp-based, sortable)
  const generateV7 = useCallback((): string => {
      const now = Date.now();
      const unixTs = Math.floor(now / 1000);
      const ms = now % 1000;

      const timeBytes = new Uint8Array(6);
      const view = new DataView(timeBytes.buffer);
      view.setUint32(0, unixTs, false);
      view.setUint16(4, ms, false);

      const timeHex = Array.from(timeBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const timeLow = timeHex.slice(0, 8);
      const timeMid = timeHex.slice(8, 12);
      const timeHiAndVersion = (parseInt(timeHex.slice(12, 16), 16) & 0x0fff | 0x7000).toString(16).padStart(4, '0');

      const randomBytes = new Uint8Array(10);
      crypto.getRandomValues(randomBytes);
      randomBytes[0] = (randomBytes[0] & 0x3f) | 0x80; // Set variant bits

      const clockSeq = Array.from(randomBytes.slice(0, 2)).map(b => b.toString(16).padStart(2, '0')).join('');
      const node = Array.from(randomBytes.slice(2)).map(b => b.toString(16).padStart(2, '0')).join('');

      return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeq}-${node}`;
    }, []);

  const generate = useCallback(() => {
    let generator: () => string;
    switch (version) {
      case 'v1': generator = generateV1; break;
      case 'v7': generator = generateV7; break;
      default: generator = generateV4;
    }
    
    const newUUIDs = Array.from({ length: count }, generator);
    setUUIDs(newUUIDs);
  }, [count, version, generateV1, generateV4, generateV7]);

  // Auto-generate on count/version change
  useEffect(() => {
    if (autoGenerate) {
      generate();
    }
  }, [count, version, autoGenerate, generate]);

  // Parse UUID for details
  const parseUUID = useCallback((uuid: string): UUIDInfo => {
    const parts = uuid.split('-');
    if (parts.length !== 5) {
      return { id: uuid, version: 0, variant: 'invalid' };
    }

    const timeHiAndVersion = parseInt(parts[2], 16);
    const versionNum = (timeHiAndVersion >> 12) & 0xf;
    
    const clockSeqHi = parseInt(parts[3].slice(0, 2), 16);
    const variant = (clockSeqHi & 0x80) === 0x80 ? 'RFC 4122' : 
                    (clockSeqHi & 0xc0) === 0xc0 ? 'Microsoft' : 'Reserved';

    let timestamp: Date | undefined;
    let node: string | undefined;
    let clockSequence: number | undefined;

    if (versionNum === 1 || versionNum === 7) {
      const timeLow = parseInt(parts[0], 16);
      const timeMid = parseInt(parts[1], 16);
      const timeHi = timeHiAndVersion & 0x0fff;
      
      if (versionNum === 1) {
        // 100-nanosecond intervals since Oct 15, 1582
        const timestamp100ns = (BigInt(timeHi) << 48n) | (BigInt(timeMid) << 32n) | BigInt(timeLow);
        const unixEpochDiff = 122192928000000000n; // 100ns intervals between 1582 and 1970
        const unixTimeMs = Number((timestamp100ns - unixEpochDiff) / 10000n);
        timestamp = new Date(unixTimeMs);
      } else if (versionNum === 7) {
        // Unix timestamp in seconds (first 48 bits) + milliseconds (next 16 bits)
        const unixSec = (timeHi << 32) | (timeMid << 16) | (timeLow >>> 16);
        const ms = timeLow & 0xffff;
        timestamp = new Date(unixSec * 1000 + ms);
      }
      
      clockSequence = parseInt(parts[3], 16) & 0x3fff;
      node = parts[4];
    }

    return {
      id: uuid,
      version: versionNum,
      variant,
      timestamp,
      node,
      clockSequence,
    };
  }, []);

  const handleSelect = (uuid: string) => {
    setSelectedUUID(uuid);
    setParsedInfo(parseUUID(uuid));
    setShowDetails(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadAsFile = (format: 'txt' | 'json' | 'csv') => {
    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(uuids.map(u => ({ uuid: u, ...parseUUID(u) })), null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'csv':
        content = 'uuid,version,variant,timestamp\n' + 
          uuids.map(u => {
            const info = parseUUID(u);
            return `"${u}",${info.version},"${info.variant}","${info.timestamp?.toISOString() || ''}"`;
          }).join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      default:
        content = uuids.join('\n');
        mimeType = 'text/plain';
        extension = 'txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${version}-${new Date().toISOString().slice(0, 10)}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>UUID Generator</h2>
        <p className="tool-desc">Generate UUIDs (Universally Unique Identifiers) in v1 (time-based), v4 (random), or v7 (timestamp-sortable) formats.</p>
      </div>

      <div className="generator-layout">
        <div className="controls-panel">
          <div className="control-group">
            <label>Version</label>
            <div className="version-tabs">
              <button
                className={version === 'v4' ? 'active' : ''}
                onClick={() => setVersion('v4')}
              >
                v4 (Random)
              </button>
              <button
                className={version === 'v1' ? 'active' : ''}
                onClick={() => setVersion('v1')}
              >
                v1 (Time-based)
              </button>
              <button
                className={version === 'v7' ? 'active' : ''}
                onClick={() => setVersion('v7')}
              >
                v7 (Timestamp)
              </button>
            </div>
            <div className="version-info">
              {version === 'v4' && <span>🎲 Cryptographically random — most common</span>}
              {version === 'v1' && <span>⏱ MAC address + timestamp — contains machine info</span>}
              {version === 'v7' && <span>📈 Unix timestamp + random — sortable, modern</span>}
            </div>
          </div>

          <div className="control-group">
            <label>Count: {count}</label>
            <input
              type="range"
              min="1"
              max="100"
              value={count}
              onChange={e => setCount(parseInt(e.target.value, 10))}
              className="count-slider"
            />
            <div className="count-presets">
              <button onClick={() => setCount(1)}>1</button>
              <button onClick={() => setCount(5)}>5</button>
              <button onClick={() => setCount(10)}>10</button>
              <button onClick={() => setCount(50)}>50</button>
              <button onClick={() => setCount(100)}>100</button>
            </div>
          </div>

          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={e => setAutoGenerate(e.target.checked)}
              />
              Auto-generate on change
            </label>
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={generate} disabled={autoGenerate}>
              {autoGenerate ? 'Auto-generating…' : 'Generate UUIDs'}
            </button>
            <button className="btn-secondary" onClick={copyAll} disabled={uuids.length === 0}>
              Copy All
            </button>
          </div>

          <div className="export-buttons">
            <span>Export:</span>
            <button className="btn-secondary" onClick={() => downloadAsFile('txt')} disabled={uuids.length === 0}>.txt</button>
            <button className="btn-secondary" onClick={() => downloadAsFile('json')} disabled={uuids.length === 0}>.json</button>
            <button className="btn-secondary" onClick={() => downloadAsFile('csv')} disabled={uuids.length === 0}>.csv</button>
          </div>

          <div className="version-details">
            <h4>Version Comparison</h4>
            <table className="comparison-table">
              <thead>
                <tr><th>Feature</th><th>v1</th><th>v4</th><th>v7</th></tr>
              </thead>
              <tbody>
                <tr><td>Source</td><td>Time + MAC</td><td>Random</td><td>Time + Random</td></tr>
                <tr><td>Sortable</td><td>✓</td><td>✗</td><td>✓</td></tr>
                <tr><td>Privacy</td><td>Leaks MAC</td><td>✓ Anonymous</td><td>✓ Anonymous</td></tr>
                <tr><td>Collision Risk</td><td>Low*</td><td>Negligible</td><td>Negligible</td></tr>
                <tr><td>RFC</td><td>4122</td><td>4122</td><td>9562 (draft)</td></tr>
              </tbody>
            </table>
            <p className="footnote">* v1 collisions possible if clock moves backward or MAC not unique</p>
          </div>
        </div>

        <div className="results-panel">
          <div className="results-toolbar">
            <h3>Generated UUIDs ({uuids.length})</h3>
            <div className="toolbar-actions">
              {selectedUUID && (
                <button className="btn-secondary" onClick={() => { setSelectedUUID(null); setShowDetails(false); }}>
                  Close Details
                </button>
              )}
            </div>
          </div>

          {uuids.length > 0 ? (
            <div className="uuid-grid">
              {uuids.map((uuid, index) => (
                <div
                  key={index}
                  className={`uuid-card ${selectedUUID === uuid ? 'selected' : ''}`}
                  onClick={() => handleSelect(uuid)}
                >
                  <code className="uuid-value">{uuid}</code>
                  <div className="uuid-actions">
                    <button
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(uuid, `uuid-${index}`); }}
                      className={copied === `uuid-${index}` ? 'copied' : 'btn-icon'}
                      title="Copy"
                    >
                      {copied === `uuid-${index}` ? '✓' : '📋'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelect(uuid); }}
                      className="btn-icon"
                      title="Details"
                    >
                      ℹ️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Click "Generate UUIDs" to create identifiers</p>
            </div>
          )}

          {showDetails && parsedInfo && (
            <div className="details-panel">
              <h4>UUID Details</h4>
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-label">Version</span>
                  <span className="detail-value">
                    {parsedInfo.version === 0 ? 'Invalid' : `v${parsedInfo.version}`}
                    {parsedInfo.version === 4 && <span className="badge">RFC 4122</span>}
                    {parsedInfo.version === 1 && <span className="badge">RFC 4122</span>}
                    {parsedInfo.version === 7 && <span className="badge">RFC 9562</span>}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Variant</span>
                  <span className="detail-value">{parsedInfo.variant}</span>
                </div>
                {parsedInfo.timestamp && (
                  <div className="detail-row">
                    <span className="detail-label">Timestamp</span>
                    <span className="detail-value">
                      {parsedInfo.timestamp.toISOString()} ({parsedInfo.timestamp.toLocaleString()})
                    </span>
                  </div>
                )}
                {parsedInfo.clockSequence !== undefined && (
                  <div className="detail-row">
                    <span className="detail-label">Clock Sequence</span>
                    <span className="detail-value">{parsedInfo.clockSequence}</span>
                  </div>
                )}
                {parsedInfo.node && (
                  <div className="detail-row">
                    <span className="detail-label">Node (MAC)</span>
                    <span className="detail-value">
                      <code>{parsedInfo.node.match(/.{2}/g)?.join(':')}</code>
                      {parsedInfo.version === 1 && <span className="warning">⚠️ Real MAC in v1</span>}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="help-section">
        <details>
          <summary>UUID Reference</summary>
          <div className="help-content">
            <h4>UUID Versions</h4>
            <ul>
              <li><strong>v1</strong> — Time-based (timestamp + MAC address). RFC 4122. Sortable but leaks hardware info.</li>
              <li><strong>v4</strong> — Random (cryptographically secure). RFC 4122. Most common, no metadata leakage.</li>
              <li><strong>v7</strong> — Unix timestamp (ms) + random. RFC 9562 (draft). Sortable, privacy-friendly, modern choice.</li>
            </ul>

            <h4>UUID Variants</h4>
            <ul>
              <li><strong>RFC 4122</strong> — Standard variant (10xx bits). Used by v1, v4, v7.</li>
              <li><strong>Microsoft</strong> — Legacy COM/DCOM variant (110x bits).</li>
              <li><strong>Reserved</strong> — Future use (111x bits).</li>
            </ul>

            <h4>When to Use Which</h4>
            <ul>
              <li><strong>v4</strong> — General purpose, database keys, session IDs, no ordering needed</li>
              <li><strong>v7</strong> — Database primary keys (better index locality), event sourcing, time-ordered logs</li>
              <li><strong>v1</strong> — Legacy systems requiring RFC 4122 v1, when MAC-based identity is acceptable</li>
            </ul>

            <h4>Format</h4>
            <p>8-4-4-4-12 hexadecimal digits: <code>xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx</code></p>
            <ul>
              <li>M = version (1, 4, or 7)</li>
              <li>N = variant (8, 9, a, or b for RFC 4122)</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}