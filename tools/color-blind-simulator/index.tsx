import React, { useState, useRef, useEffect } from 'react';

type ColorBlindType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly';

const colorBlindMatrices: Record<ColorBlindType, number[][]> = {
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758]
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7]
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525]
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114]
  ],
  protanomaly: [
    [0.817, 0.183, 0],
    [0.333, 0.667, 0],
    [0, 0.125, 0.875]
  ],
  deuteranomaly: [
    [0.8, 0.2, 0],
    [0.258, 0.742, 0],
    [0, 0.142, 0.858]
  ],
  tritanomaly: [
    [0.967, 0.033, 0],
    [0, 0.733, 0.267],
    [0, 0.183, 0.817]
  ]
};

const conditionLabels: Record<ColorBlindType, string> = {
  protanopia: 'Protanopia (Red-blind)',
  deuteranopia: 'Deuteranopia (Green-blind)',
  tritanopia: 'Tritanopia (Blue-blind)',
  achromatopsia: 'Achromatopsia (Monochromacy)',
  protanomaly: 'Protanomaly (Red-weak)',
  deuteranomaly: 'Deuteranomaly (Green-weak)',
  tritanomaly: 'Tritanomaly (Blue-weak)'
};

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}

function applyColorBlindFilter(r: number, g: number, b: number, matrix: number[][]): [number, number, number] {
  // Convert to linear RGB
  const toLinear = (c: number) => {
    c = c / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  
  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);
  
  // Apply matrix
  const rNew = rLin * matrix[0][0] + gLin * matrix[0][1] + bLin * matrix[0][2];
  const gNew = rLin * matrix[1][0] + gLin * matrix[1][1] + bLin * matrix[1][2];
  const bNew = rLin * matrix[2][0] + gLin * matrix[2][1] + bLin * matrix[2][2];
  
  // Convert back to sRGB
  const toSrgb = (c: number) => {
    return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1/2.4) - 0.055;
  };
  
  return [
    toSrgb(rNew) * 255,
    toSrgb(gNew) * 255,
    toSrgb(bNew) * 255
  ];
}

function generatePalette(baseColor: string): string[] {
  const [r, g, b] = hexToRgb(baseColor);
  const colors: string[] = [baseColor];
  
  // Generate variations
  for (let i = 1; i <= 4; i++) {
    const factor = 1 + (i * 0.15);
    colors.push(rgbToHex(r * factor, g * factor, b * factor));
    colors.push(rgbToHex(r / factor, g / factor, b / factor));
  }
  
  // Complementary
  colors.push(rgbToHex(255 - r, 255 - g, 255 - b));
  
  return colors.slice(0, 8);
}

export default function ColorBlindSimulator() {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [selectedType, setSelectedType] = useState<ColorBlindType>('protanopia');
  const [palette, setPalette] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    setPalette(generatePalette(baseColor));
  }, [baseColor]);
  
  const drawSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const matrix = colorBlindMatrices[selectedType];
    
    // Draw original palette
    const swatchWidth = width / palette.length;
    palette.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * swatchWidth, 0, swatchWidth, height / 2);
      
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(color, i * swatchWidth + swatchWidth / 2, height / 4);
    });
    
    // Draw simulated palette
    palette.forEach((color, i) => {
      const [r, g, b] = hexToRgb(color);
      const [sr, sg, sb] = applyColorBlindFilter(r, g, b, matrix);
      const simColor = rgbToHex(sr, sg, sb);
      
      ctx.fillStyle = simColor;
      ctx.fillRect(i * swatchWidth, height / 2, swatchWidth, height / 2);
      
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(simColor, i * swatchWidth + swatchWidth / 2, height * 3 / 4);
    });
    
    // Labels
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Original Colors', 10, height / 2 - 10);
    ctx.fillText(`Simulated: ${conditionLabels[selectedType]}`, 10, height - 10);
  };
  
  useEffect(() => {
    drawSimulation();
  }, [baseColor, selectedType, palette]);
  
  const types: ColorBlindType[] = [
    'protanopia', 'deuteranopia', 'tritanopia',
    'achromatopsia', 'protanomaly', 'deuteranomaly', 'tritanomaly'
  ];
  
  return (
    <div className="p-4 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold mb-2">Color Blindness Simulator</h1>
        <p className="text-gray-600">
          Simulate how colors appear to people with different types of color vision deficiency.
          Top row shows original colors, bottom row shows the simulation.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Base Color
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-16 h-10 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && setBaseColor(e.target.value)}
              className="flex-1 px-3 py-2 border rounded text-monospace"
              placeholder="#RRGGBB"
            />
          </div>
          
          <label className="block text-sm font-medium text-gray-700">
            Color Blindness Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ColorBlindType)}
            className="w-full px-3 py-2 border rounded"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {conditionLabels[type]}
              </option>
            ))}
          </select>
          
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-medium mb-2">Prevalence</h3>
            <p className="text-sm text-gray-600">
              {(() => {
                switch (selectedType) {
                  case 'protanopia': return '~1% of males, ~0.01% of females';
                  case 'deuteranopia': return '~1% of males, ~0.01% of females';
                  case 'tritanopia': return '~0.001% (very rare)';
                  case 'achromatopsia': return '~0.003% (extremely rare)';
                  case 'protanomaly': return '~1% of males, ~0.01% of females';
                  case 'deuteranomaly': return '~5% of males, ~0.35% of females (most common)';
                  case 'tritanomaly': return '~0.01% (rare)';
                }
              })()}
            </p>
          </div>
        </div>
        
        <div>
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full h-auto border rounded bg-white"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Color Palette Comparison</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {palette.map((color, i) => {
            const [r, g, b] = hexToRgb(color);
            const [sr, sg, sb] = applyColorBlindFilter(r, g, b, colorBlindMatrices[selectedType]);
            const simColor = rgbToHex(sr, sg, sb);
            
            return (
              <div key={i} className="space-y-1">
                <div
                  className="h-16 rounded border"
                  style={{ backgroundColor: color }}
                  title={`Original: ${color}`}
                />
                <div
                  className="h-16 rounded border"
                  style={{ backgroundColor: simColor }}
                  title={`Simulated: ${simColor}`}
                />
                <div className="text-xs text-center text-gray-600 font-mono">
                  {color} → {simColor}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">Design Tips for Accessibility</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Don't rely on color alone to convey information</li>
          <li>Use patterns, labels, or icons in addition to color</li>
          <li>Maintain sufficient contrast ratios (WCAG AA: 4.5:1)</li>
          <li>Test your designs with color blindness simulators</li>
          <li>Consider using color-blind safe palettes (e.g., viridis, cividis)</li>
        </ul>
      </div>
    </div>
  );
}