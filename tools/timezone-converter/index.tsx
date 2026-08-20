import { useState, useEffect, useMemo } from 'react';

export default function TimezoneConverter() {
  const [dateInput, setDateInput] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [fromTz, setFromTz] = useState('UTC');
  const [toTz, setToTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [convertedTime, setConvertedTime] = useState('');
  const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({});

  // Get all available timezones
  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone');
    } catch {
      // Fallback list
      return [
        'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'America/Anchorage', 'Pacific/Honolulu', 'America/Toronto', 'America/Vancouver',
        'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome', 'Europe/Madrid',
        'Europe/Amsterdam', 'Europe/Stockholm', 'Europe/Vienna', 'Europe/Warsaw',
        'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Seoul',
        'Asia/Dubai', 'Asia/Tel_Aviv', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Jakarta',
        'Australia/Sydney', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Brisbane',
        'Pacific/Auckland', 'Pacific/Fiji', 'America/Sao_Paulo', 'America/Argentina/Buenos_Aires',
        'America/Mexico_City', 'America/Lima', 'America/Bogota', 'Africa/Cairo',
        'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi'
      ];
    }
  }, []);

  const filteredFromTz = useMemo(() => 
    timezones.filter(tz => tz.toLowerCase().includes(fromTz.toLowerCase())).slice(0, 50),
    [timezones, fromTz]
  );

  const filteredToTz = useMemo(() => 
    timezones.filter(tz => tz.toLowerCase().includes(toTz.toLowerCase())).slice(0, 50),
    [timezones, toTz]
  );

  // Convert timezone
  useEffect(() => {
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        setConvertedTime('Invalid date');
        return;
      }
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: toTz,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      }).format(date);
      setConvertedTime(formatted);
    } catch {
      setConvertedTime('Conversion error');
    }
  }, [dateInput, fromTz, toTz]);

  // Live clock for multiple timezones
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      const times: Record<string, string> = {};
      const displayZones = [fromTz, toTz, 'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
      
      displayZones.forEach(tz => {
        try {
          times[tz] = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
          }).format(now);
        } catch {
          times[tz] = 'N/A';
        }
      });
      setCurrentTimes(times);
    };
    
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, [fromTz, toTz]);

  // Get offset string
  const getOffset = (tz: string) => {
    try {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' });
      const parts = fmt.formatToParts(now);
      const offsetPart = parts.find(p => p.type === 'timeZoneName');
      return offsetPart?.value || '';
    } catch {
      return '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const swapTimezones = () => {
    setFromTz(toTz);
    setToTz(fromTz);
  };

  const setToNow = () => {
    const now = new Date();
    setDateInput(now.toISOString().slice(0, 16));
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Timezone Converter</h2>
        <p className="tool-desc">Convert dates/times between timezones. Live world clock included.</p>
      </div>

      <div className="tool-grid">
        <div className="converter-panel">
          <div className="input-group">
            <label>Date & Time</label>
            <div className="datetime-input-row">
              <input
                type="datetime-local"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                className="datetime-input"
              />
              <button className="btn-secondary" onClick={setToNow}>Now</button>
            </div>
          </div>

          <div className="timezone-row">
            <div className="tz-input-group">
              <label>From Timezone</label>
              <div className="searchable-select">
                <input
                  type="text"
                  value={fromTz}
                  onChange={e => setFromTz(e.target.value)}
                  onFocus={() => setShowFromDropdown(true)}
                  onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
                  placeholder="Search timezone..."
                  className="tz-search-input"
                  autoComplete="off"
                />
                {showFromDropdown && (
                  <ul className="tz-dropdown">
                    {filteredFromTz.map(tz => (
                      <li
                        key={tz}
                        className={tz === fromTz ? 'selected' : ''}
                        onClick={() => { setFromTz(tz); setShowFromDropdown(false); }}
                      >
                        <span>{tz}</span>
                        <span className="tz-offset">{getOffset(tz)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button className="swap-btn" onClick={swapTimezones} title="Swap timezones">
              ⇄
            </button>

            <div className="tz-input-group">
              <label>To Timezone</label>
              <div className="searchable-select">
                <input
                  type="text"
                  value={toTz}
                  onChange={e => setToTz(e.target.value)}
                  onFocus={() => setShowToDropdown(true)}
                  onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
                  placeholder="Search timezone..."
                  className="tz-search-input"
                  autoComplete="off"
                />
                {showToDropdown && (
                  <ul className="tz-dropdown">
                    {filteredToTz.map(tz => (
                      <li
                        key={tz}
                        className={tz === toTz ? 'selected' : ''}
                        onClick={() => { setToTz(tz); setShowToDropdown(false); }}
                      >
                        <span>{tz}</span>
                        <span className="tz-offset">{getOffset(tz)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="result-panel">
            <h3>Converted Time</h3>
            <div className="result-time">{convertedTime}</div>
            <div className="result-meta">
              <span>In {toTz}</span>
              <button className="btn-copy" onClick={() => copyToClipboard(convertedTime)}>
                Copy
              </button>
            </div>
          </div>
        </div>

        <div className="world-clock-panel">
          <h3>World Clock</h3>
          <div className="clock-grid">
            {Object.entries(currentTimes).map(([tz, time]) => (
              <div key={tz} className={`clock-card ${tz === fromTz ? 'highlight-from' : ''} ${tz === toTz ? 'highlight-to' : ''}`}>
                <div className="clock-tz">{tz}</div>
                <div className="clock-time">{time}</div>
                <div className="clock-offset">{getOffset(tz)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="info-panel">
        <h3>Quick Reference</h3>
        <div className="quick-ref">
          <div className="ref-item">
            <strong>UTC</strong> - Coordinated Universal Time (baseline)
          </div>
          <div className="ref-item">
            <strong>EST/EDT</strong> - America/New_York (UTC-5/-4)
          </div>
          <div className="ref-item">
            <strong>PST/PDT</strong> - America/Los_Angeles (UTC-8/-7)
          </div>
          <div className="ref-item">
            <strong>CET/CEST</strong> - Europe/Paris (UTC+1/+2)
          </div>
          <div className="ref-item">
            <strong>JST</strong> - Asia/Tokyo (UTC+9)
          </div>
          <div className="ref-item">
            <strong>AEST/AEDT</strong> - Australia/Sydney (UTC+10/+11)
          </div>
        </div>
      </div>
    </div>
  );
}