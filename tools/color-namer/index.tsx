import { useState, useMemo } from 'react';

interface NamedColor {
  name: string;
  hex: string;
  distance: number;
}

// Common CSS/SVG named colors
const NAMED_COLORS: NamedColor[] = [
  { name: 'AliceBlue', hex: '#F0F8FF', distance: 0 },
  { name: 'AntiqueWhite', hex: '#FAEBD7', distance: 0 },
  { name: 'Aqua', hex: '#00FFFF', distance: 0 },
  { name: 'Aquamarine', hex: '#7FFFD4', distance: 0 },
  { name: 'Azure', hex: '#F0FFFF', distance: 0 },
  { name: 'Beige', hex: '#F5F5DC', distance: 0 },
  { name: 'Bisque', hex: '#FFE4C4', distance: 0 },
  { name: 'Black', hex: '#000000', distance: 0 },
  { name: 'BlanchedAlmond', hex: '#FFEBCD', distance: 0 },
  { name: 'Blue', hex: '#0000FF', distance: 0 },
  { name: 'BlueViolet', hex: '#8A2BE2', distance: 0 },
  { name: 'Brown', hex: '#A52A2A', distance: 0 },
  { name: 'BurlyWood', hex: '#DEB887', distance: 0 },
  { name: 'CadetBlue', hex: '#5F9EA0', distance: 0 },
  { name: 'Chartreuse', hex: '#7FFF00', distance: 0 },
  { name: 'Chocolate', hex: '#D2691E', distance: 0 },
  { name: 'Coral', hex: '#FF7F50', distance: 0 },
  { name: 'CornflowerBlue', hex: '#6495ED', distance: 0 },
  { name: 'Cornsilk', hex: '#FFF8DC', distance: 0 },
  { name: 'Crimson', hex: '#DC143C', distance: 0 },
  { name: 'Cyan', hex: '#00FFFF', distance: 0 },
  { name: 'DarkBlue', hex: '#00008B', distance: 0 },
  { name: 'DarkCyan', hex: '#008B8B', distance: 0 },
  { name: 'DarkGoldenRod', hex: '#B8860B', distance: 0 },
  { name: 'DarkGray', hex: '#A9A9A9', distance: 0 },
  { name: 'DarkGreen', hex: '#006400', distance: 0 },
  { name: 'DarkKhaki', hex: '#BDB76B', distance: 0 },
  { name: 'DarkMagenta', hex: '#8B008B', distance: 0 },
  { name: 'DarkOliveGreen', hex: '#556B2F', distance: 0 },
  { name: 'DarkOrange', hex: '#FF8C00', distance: 0 },
  { name: 'DarkOrchid', hex: '#9932CC', distance: 0 },
  { name: 'DarkRed', hex: '#8B0000', distance: 0 },
  { name: 'DarkSalmon', hex: '#E9967A', distance: 0 },
  { name: 'DarkSeaGreen', hex: '#8FBC8F', distance: 0 },
  { name: 'DarkSlateBlue', hex: '#483D8B', distance: 0 },
  { name: 'DarkSlateGray', hex: '#2F4F4F', distance: 0 },
  { name: 'DarkTurquoise', hex: '#00CED1', distance: 0 },
  { name: 'DarkViolet', hex: '#9400D3', distance: 0 },
  { name: 'DeepPink', hex: '#FF1493', distance: 0 },
  { name: 'DeepSkyBlue', hex: '#00BFFF', distance: 0 },
  { name: 'DimGray', hex: '#696969', distance: 0 },
  { name: 'DodgerBlue', hex: '#1E90FF', distance: 0 },
  { name: 'FireBrick', hex: '#B22222', distance: 0 },
  { name: 'FloralWhite', hex: '#FFFAF0', distance: 0 },
  { name: 'ForestGreen', hex: '#228B22', distance: 0 },
  { name: 'Fuchsia', hex: '#FF00FF', distance: 0 },
  { name: 'Gainsboro', hex: '#DCDCDC', distance: 0 },
  { name: 'GhostWhite', hex: '#F8F8FF', distance: 0 },
  { name: 'Gold', hex: '#FFD700', distance: 0 },
  { name: 'GoldenRod', hex: '#DAA520', distance: 0 },
  { name: 'Gray', hex: '#808080', distance: 0 },
  { name: 'Green', hex: '#008000', distance: 0 },
  { name: 'GreenYellow', hex: '#ADFF2F', distance: 0 },
  { name: 'HoneyDew', hex: '#F0FFF0', distance: 0 },
  { name: 'HotPink', hex: '#FF69B4', distance: 0 },
  { name: 'IndianRed', hex: '#CD5C5C', distance: 0 },
  { name: 'Indigo', hex: '#4B0082', distance: 0 },
  { name: 'Ivory', hex: '#FFFFF0', distance: 0 },
  { name: 'Khaki', hex: '#F0E68C', distance: 0 },
  { name: 'Lavender', hex: '#E6E6FA', distance: 0 },
  { name: 'LavenderBlush', hex: '#FFF0F5', distance: 0 },
  { name: 'LawnGreen', hex: '#7CFC00', distance: 0 },
  { name: 'LemonChiffon', hex: '#FFFACD', distance: 0 },
  { name: 'LightBlue', hex: '#ADD8E6', distance: 0 },
  { name: 'LightCoral', hex: '#F08080', distance: 0 },
  { name: 'LightCyan', hex: '#E0FFFF', distance: 0 },
  { name: 'LightGoldenRodYellow', hex: '#FAFAD2', distance: 0 },
  { name: 'LightGray', hex: '#D3D3D3', distance: 0 },
  { name: 'LightGreen', hex: '#90EE90', distance: 0 },
  { name: 'LightPink', hex: '#FFB6C1', distance: 0 },
  { name: 'LightSalmon', hex: '#FFA07A', distance: 0 },
  { name: 'LightSeaGreen', hex: '#20B2AA', distance: 0 },
  { name: 'LightSkyBlue', hex: '#87CEFA', distance: 0 },
  { name: 'LightSlateGray', hex: '#778899', distance: 0 },
  { name: 'LightSteelBlue', hex: '#B0C4DE', distance: 0 },
  { name: 'LightYellow', hex: '#FFFFE0', distance: 0 },
  { name: 'Lime', hex: '#00FF00', distance: 0 },
  { name: 'LimeGreen', hex: '#32CD32', distance: 0 },
  { name: 'Linen', hex: '#FAF0E6', distance: 0 },
  { name: 'Magenta', hex: '#FF00FF', distance: 0 },
  { name: 'Maroon', hex: '#800000', distance: 0 },
  { name: 'MediumAquaMarine', hex: '#66CDAA', distance: 0 },
  { name: 'MediumBlue', hex: '#0000CD', distance: 0 },
  { name: 'MediumOrchid', hex: '#BA55D3', distance: 0 },
  { name: 'MediumPurple', hex: '#9370DB', distance: 0 },
  { name: 'MediumSeaGreen', hex: '#3CB371', distance: 0 },
  { name: 'MediumSlateBlue', hex: '#7B68EE', distance: 0 },
  { name: 'MediumSpringGreen', hex: '#00FA9A', distance: 0 },
  { name: 'MediumTurquoise', hex: '#48D1CC', distance: 0 },
  { name: 'MediumVioletRed', hex: '#C71585', distance: 0 },
  { name: 'MidnightBlue', hex: '#191970', distance: 0 },
  { name: 'MintCream', hex: '#F5FFFA', distance: 0 },
  { name: 'MistyRose', hex: '#FFE4E1', distance: 0 },
  { name: 'Moccasin', hex: '#FFE4B5', distance: 0 },
  { name: 'NavajoWhite', hex: '#FFDEAD', distance: 0 },
  { name: 'Navy', hex: '#000080', distance: 0 },
  { name: 'OldLace', hex: '#FDF5E6', distance: 0 },
  { name: 'Olive', hex: '#808000', distance: 0 },
  { name: 'OliveDrab', hex: '#6B8E23', distance: 0 },
  { name: 'Orange', hex: '#FFA500', distance: 0 },
  { name: 'OrangeRed', hex: '#FF4500', distance: 0 },
  { name: 'Orchid', hex: '#DA70D6', distance: 0 },
  { name: 'PaleGoldenRod', hex: '#EEE8AA', distance: 0 },
  { name: 'PaleGreen', hex: '#98FB98', distance: 0 },
  { name: 'PaleTurquoise', hex: '#AFEEEE', distance: 0 },
  { name: 'PaleVioletRed', hex: '#DB7093', distance: 0 },
  { name: 'PapayaWhip', hex: '#FFEFD5', distance: 0 },
  { name: 'PeachPuff', hex: '#FFDAB9', distance: 0 },
  { name: 'Peru', hex: '#CD853F', distance: 0 },
  { name: 'Pink', hex: '#FFC0CB', distance: 0 },
  { name: 'Plum', hex: '#DDA0DD', distance: 0 },
  { name: 'PowderBlue', hex: '#B0E0E6', distance: 0 },
  { name: 'Purple', hex: '#800080', distance: 0 },
  { name: 'RebeccaPurple', hex: '#663399', distance: 0 },
  { name: 'Red', hex: '#FF0000', distance: 0 },
  { name: 'RosyBrown', hex: '#BC8F8F', distance: 0 },
  { name: 'RoyalBlue', hex: '#4169E1', distance: 0 },
  { name: 'SaddleBrown', hex: '#8B4513', distance: 0 },
  { name: 'Salmon', hex: '#FA8072', distance: 0 },
  { name: 'SandyBrown', hex: '#F4A460', distance: 0 },
  { name: 'SeaGreen', hex: '#2E8B57', distance: 0 },
  { name: 'SeaShell', hex: '#FFF5EE', distance: 0 },
  { name: 'Sienna', hex: '#A0522D', distance: 0 },
  { name: 'Silver', hex: '#C0C0C0', distance: 0 },
  { name: 'SkyBlue', hex: '#87CEEB', distance: 0 },
  { name: 'SlateBlue', hex: '#6A5ACD', distance: 0 },
  { name: 'SlateGray', hex: '#708090', distance: 0 },
  { name: 'Snow', hex: '#FFFAFA', distance: 0 },
  { name: 'SpringGreen', hex: '#00FF7F', distance: 0 },
  { name: 'SteelBlue', hex: '#4682B4', distance: 0 },
  { name: 'Tan', hex: '#D2B48C', distance: 0 },
  { name: 'Teal', hex: '#008080', distance: 0 },
  { name: 'Thistle', hex: '#D8BFD8', distance: 0 },
  { name: 'Tomato', hex: '#FF6347', distance: 0 },
  { name: 'Turquoise', hex: '#40E0D0', distance: 0 },
  { name: 'Violet', hex: '#EE82EE', distance: 0 },
  { name: 'Wheat', hex: '#F5DEB3', distance: 0 },
  { name: 'White', hex: '#FFFFFF', distance: 0 },
  { name: 'WhiteSmoke', hex: '#F5F5F5', distance: 0 },
  { name: 'Yellow', hex: '#FFFF00', distance: 0 },
  { name: 'YellowGreen', hex: '#9ACD32', distance: 0 },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function colorDistance(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

function findClosestNamedColor(inputHex: string): NamedColor[] {
  const inputRgb = hexToRgb(inputHex);
  if (!inputRgb) return [];

  const withDistances = NAMED_COLORS.map(nc => {
    const ncRgb = hexToRgb(nc.hex)!;
    return { ...nc, distance: colorDistance(inputRgb, ncRgb) };
  });

  return withDistances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);
}

export default function ColorNamer() {
  const [color, setColor] = useState('#3b82f6');
  const [copied, setCopied] = useState<string | null>(null);

  const closestColors = useMemo(() => findClosestNamedColor(color), [color]);
  const exactMatch = closestColors[0]?.distance === 0 ? closestColors[0] : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^#?[0-9a-fA-F]{6}$/.test(value)) {
      setColor(value.startsWith('#') ? value : `#${value}`);
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Color Namer</h2>
        <p className="tool-desc">Enter a hex color to find its closest named color match from CSS/SVG color names.</p>
      </div>

      <div className="tool-grid">
        <div className="picker-panel">
          <div className="color-preview" style={{ backgroundColor: color }}></div>
          
          <div className="color-values">
            <div className="value-row">
              <label>HEX Input</label>
              <input
                type="text"
                value={color}
                onChange={handleHexChange}
                className="color-input"
                placeholder="#RRGGBB"
                maxLength={7}
              />
            </div>
          </div>

          <div className="native-picker">
            <label>Native Picker</label>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
            />
          </div>

          {exactMatch && (
            <div className="exact-match">
              <h3>Exact Match: {exactMatch.name}</h3>
              <code>{exactMatch.hex}</code>
              <button 
                className="copy-btn" 
                onClick={() => copyToClipboard(exactMatch.name)}
              >
                {copied === exactMatch.name ? '✓ Copied!' : 'Copy Name'}
              </button>
            </div>
          )}

          {!exactMatch && closestColors.length > 0 && (
            <div className="closest-matches">
              <h3>Closest Named Colors</h3>
              <div className="matches-grid">
                {closestColors.map((nc, i) => (
                  <div key={i} className="match-card">
                    <div 
                      className="match-swatch" 
                      style={{ backgroundColor: nc.hex }}
                    ></div>
                    <div className="match-info">
                      <strong>{nc.name}</strong>
                      <code>{nc.hex}</code>
                      <span className="distance">ΔE ≈ {nc.distance.toFixed(1)}</span>
                    </div>
                    <button
                      className="copy-btn small"
                      onClick={() => copyToClipboard(nc.name)}
                    >
                      {copied === nc.name ? '✓' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="canvas-panel">
          <h3>All Named Colors Reference</h3>
          <div className="named-colors-grid">
            {NAMED_COLORS.map((nc, i) => (
              <div
                key={i}
                className="named-color-item"
                style={{ backgroundColor: nc.hex }}
                title={`${nc.name} — ${nc.hex}`}
              >
                <span className="color-name">{nc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}