import { useState, useMemo } from 'react';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'volume' | 'area' | 'speed' | 'time' | 'data' | 'pressure' | 'energy';

interface Unit {
  name: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

const UNITS: Record<UnitCategory, Unit[]> = {
  length: [
    { name: 'Meter', symbol: 'm', toBase: v => v, fromBase: v => v },
    { name: 'Kilometer', symbol: 'km', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { name: 'Centimeter', symbol: 'cm', toBase: v => v / 100, fromBase: v => v * 100 },
    { name: 'Millimeter', symbol: 'mm', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { name: 'Inch', symbol: 'in', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
    { name: 'Foot', symbol: 'ft', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    { name: 'Yard', symbol: 'yd', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
    { name: 'Mile', symbol: 'mi', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
    { name: 'Nautical Mile', symbol: 'nmi', toBase: v => v * 1852, fromBase: v => v / 1852 },
  ],
  weight: [
    { name: 'Kilogram', symbol: 'kg', toBase: v => v, fromBase: v => v },
    { name: 'Gram', symbol: 'g', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { name: 'Milligram', symbol: 'mg', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
    { name: 'Metric Ton', symbol: 't', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { name: 'Pound', symbol: 'lb', toBase: v => v * 0.45359237, fromBase: v => v / 0.45359237 },
    { name: 'Ounce', symbol: 'oz', toBase: v => v * 0.028349523125, fromBase: v => v / 0.028349523125 },
    { name: 'Stone', symbol: 'st', toBase: v => v * 6.35029318, fromBase: v => v / 6.35029318 },
    { name: 'US Ton', symbol: 'ton', toBase: v => v * 907.18474, fromBase: v => v / 907.18474 },
  ],
  temperature: [
    { name: 'Celsius', symbol: '°C', toBase: v => v, fromBase: v => v },
    { name: 'Fahrenheit', symbol: '°F', toBase: v => (v - 32) * 5/9, fromBase: v => v * 9/5 + 32 },
    { name: 'Kelvin', symbol: 'K', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    { name: 'Rankine', symbol: '°R', toBase: v => (v - 491.67) * 5/9, fromBase: v => v * 9/5 + 491.67 },
  ],
  volume: [
    { name: 'Liter', symbol: 'L', toBase: v => v, fromBase: v => v },
    { name: 'Milliliter', symbol: 'mL', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { name: 'Cubic Meter', symbol: 'm³', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { name: 'Cubic Centimeter', symbol: 'cm³', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { name: 'US Gallon', symbol: 'gal', toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
    { name: 'US Quart', symbol: 'qt', toBase: v => v * 0.946353, fromBase: v => v / 0.946353 },
    { name: 'US Pint', symbol: 'pt', toBase: v => v * 0.473176, fromBase: v => v / 0.473176 },
    { name: 'US Cup', symbol: 'cup', toBase: v => v * 0.236588, fromBase: v => v / 0.236588 },
    { name: 'US Fluid Ounce', symbol: 'fl oz', toBase: v => v * 0.0295735, fromBase: v => v / 0.0295735 },
    { name: 'Imperial Gallon', symbol: 'gal (UK)', toBase: v => v * 4.54609, fromBase: v => v / 4.54609 },
    { name: 'Imperial Pint', symbol: 'pt (UK)', toBase: v => v * 0.568261, fromBase: v => v / 0.568261 },
  ],
  area: [
    { name: 'Square Meter', symbol: 'm²', toBase: v => v, fromBase: v => v },
    { name: 'Square Kilometer', symbol: 'km²', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
    { name: 'Square Centimeter', symbol: 'cm²', toBase: v => v / 1e4, fromBase: v => v * 1e4 },
    { name: 'Square Millimeter', symbol: 'mm²', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
    { name: 'Hectare', symbol: 'ha', toBase: v => v * 10000, fromBase: v => v / 10000 },
    { name: 'Square Inch', symbol: 'in²', toBase: v => v * 0.00064516, fromBase: v => v / 0.00064516 },
    { name: 'Square Foot', symbol: 'ft²', toBase: v => v * 0.092903, fromBase: v => v / 0.092903 },
    { name: 'Square Yard', symbol: 'yd²', toBase: v => v * 0.836127, fromBase: v => v / 0.836127 },
    { name: 'Acre', symbol: 'ac', toBase: v => v * 4046.86, fromBase: v => v / 4046.86 },
    { name: 'Square Mile', symbol: 'mi²', toBase: v => v * 2589988, fromBase: v => v / 2589988 },
  ],
  speed: [
    { name: 'Meter/second', symbol: 'm/s', toBase: v => v, fromBase: v => v },
    { name: 'Kilometer/hour', symbol: 'km/h', toBase: v => v / 3.6, fromBase: v => v * 3.6 },
    { name: 'Mile/hour', symbol: 'mph', toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
    { name: 'Knot', symbol: 'kn', toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
    { name: 'Foot/second', symbol: 'ft/s', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    { name: 'Mach', symbol: 'Mach', toBase: v => v * 343, fromBase: v => v / 343 },
  ],
  time: [
    { name: 'Second', symbol: 's', toBase: v => v, fromBase: v => v },
    { name: 'Millisecond', symbol: 'ms', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { name: 'Microsecond', symbol: 'µs', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
    { name: 'Minute', symbol: 'min', toBase: v => v * 60, fromBase: v => v / 60 },
    { name: 'Hour', symbol: 'h', toBase: v => v * 3600, fromBase: v => v / 3600 },
    { name: 'Day', symbol: 'd', toBase: v => v * 86400, fromBase: v => v / 86400 },
    { name: 'Week', symbol: 'wk', toBase: v => v * 604800, fromBase: v => v / 604800 },
    { name: 'Month (30d)', symbol: 'mo', toBase: v => v * 2592000, fromBase: v => v / 2592000 },
    { name: 'Year (365d)', symbol: 'yr', toBase: v => v * 31536000, fromBase: v => v / 31536000 },
  ],
  data: [
    { name: 'Bit', symbol: 'b', toBase: v => v, fromBase: v => v },
    { name: 'Byte', symbol: 'B', toBase: v => v * 8, fromBase: v => v / 8 },
    { name: 'Kilobit', symbol: 'kb', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { name: 'Kibibit', symbol: 'Kib', toBase: v => v * 1024, fromBase: v => v / 1024 },
    { name: 'Kilobyte', symbol: 'KB', toBase: v => v * 8000, fromBase: v => v / 8000 },
    { name: 'Kibibyte', symbol: 'KiB', toBase: v => v * 8192, fromBase: v => v / 8192 },
    { name: 'Megabit', symbol: 'Mb', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
    { name: 'Mebibit', symbol: 'Mib', toBase: v => v * 1048576, fromBase: v => v / 1048576 },
    { name: 'Megabyte', symbol: 'MB', toBase: v => v * 8e6, fromBase: v => v / 8e6 },
    { name: 'Mebibyte', symbol: 'MiB', toBase: v => v * 8388608, fromBase: v => v / 8388608 },
    { name: 'Gigabit', symbol: 'Gb', toBase: v => v * 1e9, fromBase: v => v / 1e9 },
    { name: 'Gibibit', symbol: 'Gib', toBase: v => v * 1073741824, fromBase: v => v / 1073741824 },
    { name: 'Gigabyte', symbol: 'GB', toBase: v => v * 8e9, fromBase: v => v / 8e9 },
    { name: 'Gibibyte', symbol: 'GiB', toBase: v => v * 8589934592, fromBase: v => v / 8589934592 },
    { name: 'Terabyte', symbol: 'TB', toBase: v => v * 8e12, fromBase: v => v / 8e12 },
    { name: 'Tebibyte', symbol: 'TiB', toBase: v => v * 8796093022208, fromBase: v => v / 8796093022208 },
  ],
  pressure: [
    { name: 'Pascal', symbol: 'Pa', toBase: v => v, fromBase: v => v },
    { name: 'Kilopascal', symbol: 'kPa', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { name: 'Megapascal', symbol: 'MPa', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
    { name: 'Bar', symbol: 'bar', toBase: v => v * 100000, fromBase: v => v / 100000 },
    { name: 'Millibar', symbol: 'mbar', toBase: v => v * 100, fromBase: v => v / 100 },
    { name: 'Atmosphere', symbol: 'atm', toBase: v => v * 101325, fromBase: v => v / 101325 },
    { name: 'PSI', symbol: 'psi', toBase: v => v * 6894.76, fromBase: v => v / 6894.76 },
    { name: 'Torr', symbol: 'Torr', toBase: v => v * 133.322, fromBase: v => v / 133.322 },
    { name: 'mmHg', symbol: 'mmHg', toBase: v => v * 133.322, fromBase: v => v / 133.322 },
  ],
  energy: [
    { name: 'Joule', symbol: 'J', toBase: v => v, fromBase: v => v },
    { name: 'Kilojoule', symbol: 'kJ', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { name: 'Calorie', symbol: 'cal', toBase: v => v * 4.184, fromBase: v => v / 4.184 },
    { name: 'Kilocalorie', symbol: 'kcal', toBase: v => v * 4184, fromBase: v => v / 4184 },
    { name: 'Watt-hour', symbol: 'Wh', toBase: v => v * 3600, fromBase: v => v / 3600 },
    { name: 'Kilowatt-hour', symbol: 'kWh', toBase: v => v * 3.6e6, fromBase: v => v / 3.6e6 },
    { name: 'BTU', symbol: 'BTU', toBase: v => v * 1055.06, fromBase: v => v / 1055.06 },
    { name: 'Electronvolt', symbol: 'eV', toBase: v => v * 1.602176634e-19, fromBase: v => v / 1.602176634e-19 },
    { name: 'Foot-pound', symbol: 'ft·lb', toBase: v => v * 1.35582, fromBase: v => v / 1.35582 },
  ],
};

const CATEGORIES: { key: UnitCategory; label: string; icon: string }[] = [
  { key: 'length', label: 'Length', icon: '📏' },
  { key: 'weight', label: 'Weight/Mass', icon: '⚖️' },
  { key: 'temperature', label: 'Temperature', icon: '🌡️' },
  { key: 'volume', label: 'Volume', icon: '🧪' },
  { key: 'area', label: 'Area', icon: '📐' },
  { key: 'speed', label: 'Speed', icon: '🏎️' },
  { key: 'time', label: 'Time', icon: '⏱️' },
  { key: 'data', label: 'Data', icon: '💾' },
  { key: 'pressure', label: 'Pressure', icon: '💨' },
  { key: 'energy', label: 'Energy', icon: '⚡' },
];

export default function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState<string>(UNITS.length[0].symbol);
  const [toUnit, setToUnit] = useState<string>(UNITS.length[1].symbol);
  const [inputValue, setInputValue] = useState<string>('1');
  const [outputValue, setOutputValue] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [swapAnim, setSwapAnim] = useState(false);

  const units = UNITS[category];
  const fromUnitDef = units.find(u => u.symbol === fromUnit);
  const toUnitDef = units.find(u => u.symbol === toUnit);

  const convert = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || !fromUnitDef || !toUnitDef) return '';
    
    const baseValue = fromUnitDef.toBase(num);
    const result = toUnitDef.fromBase(baseValue);
    
    // Format output nicely
    if (Math.abs(result) >= 1e6 || (Math.abs(result) < 1e-4 && result !== 0)) {
      return result.toExponential(6);
    }
    return Number(result.toPrecision(10)).toString();
  }, [inputValue, fromUnit, toUnit, category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val === '' || val === '-' || val === '.') {
      setOutputValue('');
    }
  };

  const handleSwap = () => {
    setSwapAnim(true);
    setTimeout(() => {
      setFromUnit(toUnit);
      setToUnit(fromUnit);
      setInputValue(outputValue);
      setOutputValue(inputValue);
      setSwapAnim(false);
    }, 150);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(outputValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = (val: string, from: string, to: string, cat: UnitCategory) => {
    setCategory(cat);
    setFromUnit(from);
    setToUnit(to);
    setInputValue(val);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Unit Converter</h2>
        <p className="tool-desc">Convert between units across 10 categories. Real-time conversion with swap and copy.</p>
      </div>

      <div className="converter-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Conversion</h3>
          </div>

          <div className="category-selector">
            <label>Category</label>
            <div className="category-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  className={category === cat.key ? 'active' : ''}
                  onClick={() => {
                    setCategory(cat.key);
                    const newUnits = UNITS[cat.key];
                    setFromUnit(newUnits[0].symbol);
                    setToUnit(newUnits[1].symbol);
                  }}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="conversion-row">
            <div className="unit-input-group">
              <label>From</label>
              <div className="input-with-select">
                <input
                  type="text"
                  className="value-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Enter value"
                  spellCheck={false}
                />
                <select
                  value={fromUnit}
                  onChange={e => setFromUnit(e.target.value)}
                  className="unit-select"
                >
                  {units.map(u => (
                    <option key={u.symbol} value={u.symbol}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className={`swap-btn ${swapAnim ? 'swapping' : ''}`}
              onClick={handleSwap}
              title="Swap units"
              aria-label="Swap from and to units"
            >
              ⇄
            </button>

            <div className="unit-input-group">
              <label>To</label>
              <div className="input-with-select output">
                <input
                  type="text"
                  className="value-input output-value"
                  value={outputValue || convert}
                  readOnly
                  spellCheck={false}
                />
                <select
                  value={toUnit}
                  onChange={e => setToUnit(e.target.value)}
                  className="unit-select"
                >
                  {units.map(u => (
                    <option key={u.symbol} value={u.symbol}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {outputValue && (
            <button className="copy-btn" onClick={copyOutput}>
              {copied ? '✓ Copied!' : 'Copy Result'}
            </button>
          )}

          <div className="examples-section">
            <h4>Quick Examples</h4>
            <div className="example-buttons">
              <button className="btn-example" onClick={() => loadExample('100', '°C', '°F', 'temperature')}>100°C → °F</button>
              <button className="btn-example" onClick={() => loadExample('1', 'mi', 'km', 'length')}>1 mile → km</button>
              <button className="btn-example" onClick={() => loadExample('1', 'kg', 'lb', 'weight')}>1 kg → lb</button>
              <button className="btn-example" onClick={() => loadExample('1', 'gal', 'L', 'volume')}>1 gal → L</button>
              <button className="btn-example" onClick={() => loadExample('1', 'ac', 'm²', 'area')}>1 acre → m²</button>
              <button className="btn-example" onClick={() => loadExample('60', 'mph', 'km/h', 'speed')}>60 mph → km/h</button>
              <button className="btn-example" onClick={() => loadExample('1', 'GB', 'MiB', 'data')}>1 GB → MiB</button>
              <button className="btn-example" onClick={() => loadExample('1', 'atm', 'psi', 'pressure')}>1 atm → psi</button>
              <button className="btn-example" onClick={() => loadExample('1', 'kWh', 'J', 'energy')}>1 kWh → J</button>
            </div>
          </div>

          <div className="formula-section">
            <h4>Conversion Formula</h4>
            {fromUnitDef && toUnitDef && (
              <div className="formula-display">
                <code>
                  {fromUnitDef.symbol} → base → {toUnitDef.symbol}
                  <br />
                  {category === 'temperature' 
                    ? `Special: ${fromUnitDef.name} uses offset conversion`
                    : `value × ${fromUnitDef.toBase(1).toPrecision(6)} ÷ ${toUnitDef.toBase(1).toPrecision(6)}`}
                </code>
              </div>
            )}
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-toolbar">
            <h3>All Conversions for {inputValue || '1'} {fromUnitDef?.name || fromUnit}</h3>
          </div>
          <div className="conversion-table">
            <table>
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit, i) => {
                  const num = parseFloat(inputValue) || 1;
                  const baseValue = fromUnitDef ? fromUnitDef.toBase(num) : num;
                  const converted = unit.fromBase(baseValue);
                  const formatted = Math.abs(converted) >= 1e6 || (Math.abs(converted) < 1e-4 && converted !== 0)
                    ? converted.toExponential(6)
                    : Number(converted.toPrecision(10)).toString();
                  
                  return (
                    <tr key={i} className={unit.symbol === toUnit ? 'highlight' : ''}>
                      <td>
                        <span className="unit-name">{unit.name}</span>
                        <span className="unit-symbol">({unit.symbol})</span>
                      </td>
                      <td>
                        <code>{formatted}</code>
                        {unit.symbol === toUnit && <span className="target-badge">← target</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}