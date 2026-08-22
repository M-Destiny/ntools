import React, { useState, useCallback } from 'react';

interface OptimizationOptions {
  removeComments: boolean;
  removeMetadata: boolean;
  removeUselessDefs: boolean;
  removeEmptyAttrs: boolean;
  removeHiddenElems: boolean;
  removeEmptyText: boolean;
  removeEmptyContainers: boolean;
  minifyStyles: boolean;
  convertColors: boolean;
  convertPathData: boolean;
  convertTransform: boolean;
  removeUnknownsAndDefaults: boolean;
  removeNonInheritableGroupAttrs: boolean;
  removeUselessStrokeAndFill: boolean;
  removeUnusedNS: boolean;
  cleanupIDs: boolean;
  cleanupNumericValues: boolean;
  moveElemsAttrsToGroup: boolean;
  moveGroupAttrsToElems: boolean;
  collapseGroups: boolean;
  convertShapeToPath: boolean;
  convertEllipseToCircle: boolean;
}

const defaultOptions: OptimizationOptions = {
  removeComments: true,
  removeMetadata: true,
  removeUselessDefs: true,
  removeEmptyAttrs: true,
  removeHiddenElems: true,
  removeEmptyText: true,
  removeEmptyContainers: true,
  minifyStyles: true,
  convertColors: true,
  convertPathData: true,
  convertTransform: true,
  removeUnknownsAndDefaults: true,
  removeNonInheritableGroupAttrs: true,
  removeUselessStrokeAndFill: true,
  removeUnusedNS: true,
  cleanupIDs: true,
  cleanupNumericValues: true,
  moveElemsAttrsToGroup: true,
  moveGroupAttrsToElems: true,
  collapseGroups: true,
  convertShapeToPath: true,
  convertEllipseToCircle: true
};

const optionLabels: Record<keyof OptimizationOptions, string> = {
  removeComments: 'Remove Comments',
  removeMetadata: 'Remove Metadata (<metadata>, <title>, <desc>)',
  removeUselessDefs: 'Remove Unused <defs>',
  removeEmptyAttrs: 'Remove Empty Attributes',
  removeHiddenElems: 'Remove Hidden Elements (display="none")',
  removeEmptyText: 'Remove Empty Text Elements',
  removeEmptyContainers: 'Remove Empty Containers',
  minifyStyles: 'Minify Styles',
  convertColors: 'Convert Colors (rgb to hex, named to hex)',
  convertPathData: 'Optimize Path Data',
  convertTransform: 'Optimize Transforms',
  removeUnknownsAndDefaults: 'Remove Unknown Elements & Defaults',
  removeNonInheritableGroupAttrs: 'Remove Non-inheritable Group Attributes',
  removeUselessStrokeAndFill: 'Remove Useless Stroke & Fill',
  removeUnusedNS: 'Remove Unused Namespaces',
  cleanupIDs: 'Cleanup IDs (minify, remove unused)',
  cleanupNumericValues: 'Round Numeric Values',
  moveElemsAttrsToGroup: 'Move Element Attributes to Group',
  moveGroupAttrsToElems: 'Move Group Attributes to Elements',
  collapseGroups: 'Collapse Unnecessary Groups',
  convertShapeToPath: 'Convert Shapes to Paths',
  convertEllipseToCircle: 'Convert Ellipses to Circles'
};

const optionDescriptions: Record<keyof OptimizationOptions, string> = {
  removeComments: 'Strip all XML comments from the SVG',
  removeMetadata: 'Remove <metadata>, <title>, <desc> elements',
  removeUselessDefs: 'Remove <defs> elements that are not referenced',
  removeEmptyAttrs: 'Remove attributes with empty values',
  removeHiddenElems: 'Remove elements with display="none" or visibility="hidden"',
  removeEmptyText: 'Remove text elements with no content',
  removeEmptyContainers: 'Remove <g>, <svg> containers with no children',
  minifyStyles: 'Minify CSS in <style> elements and style attributes',
  convertColors: 'Convert rgb(), rgba(), named colors to hex format',
  convertPathData: 'Optimize path data (remove redundant commands, round numbers)',
  convertTransform: 'Optimize transform matrices, combine transforms',
  removeUnknownsAndDefaults: 'Remove unknown elements and default attribute values',
  removeNonInheritableGroupAttrs: 'Remove non-inheritable attributes from groups',
  removeUselessStrokeAndFill: 'Remove stroke/fill when they have no visual effect',
  removeUnusedNS: 'Remove unused namespace declarations',
  cleanupIDs: 'Minify IDs and remove unused ID references',
  cleanupNumericValues: 'Round numeric values to specified precision',
  moveElemsAttrsToGroup: 'Move common attributes from elements to parent group',
  moveGroupAttrsToElems: 'Move group attributes to child elements when beneficial',
  collapseGroups: 'Remove groups that only serve as wrappers',
  convertShapeToPath: 'Convert <rect>, <circle>, <ellipse>, <line>, <polygon> to <path>',
  convertEllipseToCircle: 'Convert <ellipse> with equal radii to <circle>'
};

function optimizeSVG(svg: string, options: OptimizationOptions): { optimized: string; originalSize: number; optimizedSize: number; savings: number } {
  let result = svg;
  const originalSize = new Blob([svg]).size;
  
  if (options.removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }
  
  if (options.removeMetadata) {
    result = result.replace(/<\/?(metadata|title|desc)[^>]*>[\s\S]*?<\/(metadata|title|desc)>/gi, '');
    result = result.replace(/<(metadata|title|desc)\s*\/>/gi, '');
  }
  
  if (options.removeEmptyAttrs) {
    result = result.replace(/\s+\w+=""/g, '');
    result = result.replace(/\s+\w+=''/g, '');
  }
  
  if (options.removeHiddenElems) {
    result = result.replace(/<[^>]*(display\s*:\s*none|visibility\s*:\s*hidden)[^>]*>[\s\S]*?<\/[^>]+>/gi, '');
    result = result.replace(/<[^>]*\s(display|visibility)\s*=\s*["'](none|hidden)["'][^>]*\s*\/>/gi, '');
  }
  
  if (options.removeEmptyText) {
    result = result.replace(/<text[^>]*>\s*<\/text>/gi, '');
    result = result.replace(/<text[^>]*\/>/gi, '');
  }
  
  if (options.minifyStyles) {
    result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, (match) => {
      const content = match.replace(/<\/?style[^>]*>/gi, '');
      const minified = content
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .replace(/;\}/g, '}')
        .trim();
      return `<style>${minified}</style>`;
    });
    result = result.replace(/style="([^"]*)"/gi, (match, styles) => {
      const minified = styles
        .replace(/\s+/g, ' ')
        .replace(/\s*([:;])\s*/g, '$1')
        .replace(/;\s*$/g, '')
        .trim();
      return `style="${minified}"`;
    });
  }
  
  if (options.convertColors) {
    const namedColors: Record<string, string> = {
      'aliceblue': '#f0f8ff', 'antiquewhite': '#faebd7', 'aqua': '#00ffff',
      'aquamarine': '#7fffd4', 'azure': '#f0ffff', 'beige': '#f5f5dc',
      'bisque': '#ffe4c4', 'black': '#000000', 'blanchedalmond': '#ffebcd',
      'blue': '#0000ff', 'blueviolet': '#8a2be2', 'brown': '#a52a2a',
      'burlywood': '#deb887', 'cadetblue': '#5f9ea0', 'chartreuse': '#7fff00',
      'chocolate': '#d2691e', 'coral': '#ff7f50', 'cornflowerblue': '#6495ed',
      'cornsilk': '#fff8dc', 'crimson': '#dc143c', 'cyan': '#00ffff',
      'darkblue': '#00008b', 'darkcyan': '#008b8b', 'darkgoldenrod': '#b8860b',
      'darkgray': '#a9a9a9', 'darkgreen': '#006400', 'darkgrey': '#a9a9a9',
      'darkkhaki': '#bdb76b', 'darkmagenta': '#8b008b', 'darkolivegreen': '#556b2f',
      'darkorange': '#ff8c00', 'darkorchid': '#9932cc', 'darkred': '#8b0000',
      'darksalmon': '#e9967a', 'darkseagreen': '#8fbc8f', 'darkslateblue': '#483d8b',
      'darkslategray': '#2f4f4f', 'darkslategrey': '#2f4f4f', 'darkturquoise': '#00ced1',
      'darkviolet': '#9400d3', 'deeppink': '#ff1493', 'deepskyblue': '#00bfff',
      'dimgray': '#696969', 'dimgrey': '#696969', 'dodgerblue': '#1e90ff',
      'firebrick': '#b22222', 'floralwhite': '#fffaf0', 'forestgreen': '#228b22',
      'fuchsia': '#ff00ff', 'gainsboro': '#dcdcdc', 'ghostwhite': '#f8f8ff',
      'gold': '#ffd700', 'goldenrod': '#daa520', 'gray': '#808080',
      'green': '#008000', 'greenyellow': '#adff2f', 'grey': '#808080',
      'honeydew': '#f0fff0', 'hotpink': '#ff69b4', 'indianred': '#cd5c5c',
      'indigo': '#4b0082', 'ivory': '#fffff0', 'khaki': '#f0e68c',
      'lavender': '#e6e6fa', 'lavenderblush': '#fff0f5', 'lawngreen': '#7cfc00',
      'lemonchiffon': '#fffacd', 'lightblue': '#add8e6', 'lightcoral': '#f08080',
      'lightcyan': '#e0ffff', 'lightgoldenrodyellow': '#fafad2', 'lightgray': '#d3d3d3',
      'lightgreen': '#90ee90', 'lightgrey': '#d3d3d3', 'lightpink': '#ffb6c1',
      'lightsalmon': '#ffa07a', 'lightseagreen': '#20b2aa', 'lightskyblue': '#87cefa',
      'lightslategray': '#778899', 'lightslategrey': '#778899', 'lightsteelblue': '#b0c4de',
      'lightyellow': '#ffffe0', 'lime': '#00ff00', 'limegreen': '#32cd32',
      'linen': '#faf0e6', 'magenta': '#ff00ff', 'maroon': '#800000',
      'mediumaquamarine': '#66cdaa', 'mediumblue': '#0000cd', 'mediumorchid': '#ba55d3',
      'mediumpurple': '#9370db', 'mediumseagreen': '#3cb371', 'mediumslateblue': '#7b68ee',
      'mediumspringgreen': '#00fa9a', 'mediumturquoise': '#48d1cc', 'mediumvioletred': '#c71585',
      'midnightblue': '#191970', 'mintcream': '#f5fffa', 'mistyrose': '#ffe4e1',
      'moccasin': '#ffe4b5', 'navajowhite': '#ffdead', 'navy': '#000080',
      'oldlace': '#fdf5e6', 'olive': '#808000', 'olivedrab': '#6b8e23',
      'orange': '#ffa500', 'orangered': '#ff4500', 'orchid': '#da70d6',
      'palegoldenrod': '#eee8aa', 'palegreen': '#98fb98', 'paleturquoise': '#afeeee',
      'palevioletred': '#db7093', 'papayawhip': '#ffefd5', 'peachpuff': '#ffdab9',
      'peru': '#cd853f', 'pink': '#ffc0cb', 'plum': '#dda0dd', 'powderblue': '#b0e0e6',
      'purple': '#800080', 'rebeccapurple': '#663399', 'red': '#ff0000',
      'rosybrown': '#bc8f8f', 'royalblue': '#4169e1', 'saddlebrown': '#8b4513',
      'salmon': '#fa8072', 'sandybrown': '#f4a460', 'seagreen': '#2e8b57',
      'seashell': '#fff5ee', 'sienna': '#a0522d', 'silver': '#c0c0c0',
      'skyblue': '#87ceeb', 'slateblue': '#6a5acd', 'slategray': '#708090',
      'slategrey': '#708090', 'snow': '#fffafa', 'springgreen': '#00ff7f',
      'steelblue': '#4682b4', 'tan': '#d2b48c', 'teal': '#008080',
      'thistle': '#d8bfd8', 'tomato': '#ff6347', 'turquoise': '#40e0d0',
      'violet': '#ee82ee', 'wheat': '#f5deb3', 'white': '#ffffff',
      'whitesmoke': '#f5f5f5', 'yellow': '#ffff00', 'yellowgreen': '#9acd32'
    };
    
    // Convert named colors to hex
    Object.entries(namedColors).forEach(([name, hex]) => {
      const regex = new RegExp(`\\b${name}\\b`, 'gi');
      result = result.replace(regex, hex);
    });
    
    // Convert rgb() to hex
    result = result.replace(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi, (match: string, r: string, g: string, b: string) => {
      return '#' + [r, g, b].map(v => parseInt(v).toString(16).padStart(2, '0')).join('');
    });
    
    // Convert rgba() to hex (ignore alpha for simplicity)
    result = result.replace(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\)\)/gi, (match: string, r: string, g: string, b: string) => {
      return '#' + [r, g, b].map(v => parseInt(v).toString(16).padStart(2, '0')).join('');
    });
  }
  
  if (options.convertPathData) {
    result = result.replace(/d="([^"]*)"/gi, (match: string, pathData: string) => {
      let optimized = pathData
        .replace(/\s+/g, ' ')
        .replace(/\s*([MmZzLlHhVvCcSsQqTtAa])\s*/g, '$1')
        .replace(/([MmZzLlHhVvCcSsQqTtAa])\s+/g, '$1 ')
        .replace(/\s*,\s*/g, ',')
        .replace(/(\d)\s*-\s*(\d)/g, '$1-$2')
        .replace(/(\d)\.(\d{3,})/g, (_m: string, int: string, dec: string) => `${int}.${dec.slice(0, 3)}`);
      return `d="${optimized.trim()}"`;
    });
  }
  
  if (options.cleanupNumericValues) {
    result = result.replace(/(\d\.\d{4,})/g, (match: string) => parseFloat(match).toFixed(3));
  }
  
  if (options.removeUnknownsAndDefaults) {
    // Remove default attributes
    const defaultAttrs = [
      'fill="black"', 'fill="#000"', 'fill="#000000"',
      'stroke="none"', 'stroke-width="1"', 'opacity="1"',
      'font-size="12px"', 'font-family="sans-serif"'
    ];
    defaultAttrs.forEach(attr => {
      result = result.replace(new RegExp(`\\s+${attr.replace(/"/g, '\\"')}`, 'g'), '');
    });
  }
  
  if (options.removeEmptyContainers) {
    let prevResult = '';
    while (prevResult !== result) {
      prevResult = result;
      result = result.replace(/<(g|svg)[^>]*>\s*<\/\1>/gi, '');
    }
  }
  
  if (options.removeUselessDefs) {
    // Extract all ID references
    const idRefs = new Set<string>();
    for (const m of result.matchAll(/url\(#([^)]+)\)/g)) idRefs.add(m[1]);
    for (const m of result.matchAll(/#([\w-]+)/g)) idRefs.add(m[1]);
    for (const m of result.matchAll(/xlink:href="#([^"]+)"/g)) idRefs.add(m[1]);
    for (const m of result.matchAll(/href="#([^"]+)"/g)) idRefs.add(m[1]);
    
    // Remove defs with unused IDs
    result = result.replace(/<defs[^>]*>[\s\S]*?<\/defs>/gi, (match: string) => {
      const idsInDefs = new Set<string>();
      for (const m of match.matchAll(/id="([^"]+)"/g)) idsInDefs.add(m[1]);
      const hasReferencedId = Array.from(idsInDefs).some(id => idRefs.has(id));
      return hasReferencedId ? match : '';
    });
  }
  
  if (options.collapseGroups) {
    let prevResult = '';
    while (prevResult !== result) {
      prevResult = result;
      // Collapse single-child groups without transform/opacity/etc
      result = result.replace(/<g[^>]*>\s*<([^>\s]+)([^>]*)>\s*<\/\1>\s*<\/g>/gi, '<$1$2/>');
      result = result.replace(/<g[^>]*>\s*<([^>\s]+)([^>]*)>([\s\S]*?)<\/\1>\s*<\/g>/gi, (match, tag, attrs, content) => {
        if (!attrs.includes('transform') && !attrs.includes('opacity') && !attrs.includes('filter') && !attrs.includes('mask')) {
          return `<${tag}${attrs}>${content}</${tag}>`;
        }
        return match;
      });
    }
  }
  
  // Final cleanup - remove extra whitespace
  result = result
    .replace(/\n\s*\n/g, '\n')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  const optimizedSize = new Blob([result]).size;
  const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
  
  return { optimized: result, originalSize, optimizedSize, savings: parseFloat(savings) };
}

export default function SVGOptimizer() {
  const [inputSVG, setInputSVG] = useState('');
  const [outputSVG, setOutputSVG] = useState('');
  const [options, setOptions] = useState<OptimizationOptions>(defaultOptions);
  const [stats, setStats] = useState<{ originalSize: number; optimizedSize: number; savings: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'options' | 'preview'>('editor');
  
  const handleOptimize = useCallback(() => {
    setError(null);
    try {
      // Basic validation
      if (!inputSVG.trim()) {
        setError('Please enter SVG code');
        return;
      }
      if (!inputSVG.trim().startsWith('<svg')) {
        setError('Input must start with <svg> element');
        return;
      }
      
      const result = optimizeSVG(inputSVG, options);
      setOutputSVG(result.optimized);
      setStats({ originalSize: result.originalSize, optimizedSize: result.optimizedSize, savings: result.savings });
      setActiveTab('preview');
    } catch (e) {
      setError('Optimization failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  }, [inputSVG, options]);
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputSVG(text);
      setError(null);
    } catch {
      setError('Failed to read clipboard');
    }
  };
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputSVG);
      setError('Copied to clipboard!');
      setTimeout(() => setError(null), 2000);
    } catch {
      setError('Failed to copy');
    }
  };
  
  const handleDownload = () => {
    const blob = new Blob([outputSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const sampleSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- This is a comment that will be removed -->
  <title>Sample SVG</title>
  <desc>Description that will be removed</desc>
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(0,0,255);stop-opacity:1" />
    </linearGradient>
    <filter id="unused-filter">
      <feGaussianBlur stdDeviation="5" />
    </filter>
  </defs>
  <g transform="translate(0, 0)">
    <rect x="10" y="10" width="80" height="80" fill="red" stroke="black" stroke-width="2" />
    <circle cx="50" cy="50" r="30" fill="url(#grad1)" />
    <text x="50" y="55" text-anchor="middle" fill="white" font-size="12">SVG</text>
    <g>
      <rect x="20" y="20" width="10" height="10" fill="blue" />
    </g>
  </g>
  <path d="M 10 10 L 90 10 L 90 90 L 10 90 Z" fill="none" stroke="green" stroke-width="1" />
</svg>`;
  
  const toggleOption = (key: keyof OptimizationOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const selectAllOptions = (value: boolean) => {
    const newOptions: OptimizationOptions = {} as OptimizationOptions;
    (Object.keys(defaultOptions) as Array<keyof OptimizationOptions>).forEach(key => {
      newOptions[key] = value;
    });
    setOptions(newOptions);
  };
  
  return (
    <div className="p-4 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold mb-2">SVG Optimizer</h1>
        <p className="text-gray-600">
          Optimize and minify SVG files by removing unnecessary data, minifying styles,
          optimizing paths, and applying various compression techniques.
        </p>
      </div>
      
      {error && (
        <div className={`p-3 rounded ${error.includes('Copied') || error.includes('optimization failed') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
          {error}
        </div>
      )}
      
      <div className="flex gap-2 border-b border-gray-200">
        {(['editor', 'options', 'preview'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
              activeTab === tab
                ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium">Input SVG</label>
              <div className="flex gap-2">
                <button
                  onClick={handlePaste}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  Paste from Clipboard
                </button>
                <button
                  onClick={() => setInputSVG(sampleSVG)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  Load Sample
                </button>
              </div>
            </div>
            <textarea
              value={inputSVG}
              onChange={(e) => setInputSVG(e.target.value)}
              className="w-full h-96 font-mono text-sm p-3 border rounded bg-gray-50 resize-none"
              placeholder="Paste your SVG code here..."
              spellCheck={false}
            />
            <button
              onClick={handleOptimize}
              disabled={!inputSVG.trim()}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Optimize SVG
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="font-medium">Output SVG</label>
            <div className="flex gap-2 mb-2">
              <button
                onClick={handleCopy}
                disabled={!outputSVG}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleDownload}
                disabled={!outputSVG}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Download .svg
              </button>
            </div>
            <textarea
              value={outputSVG}
              readOnly
              className="w-full h-96 font-mono text-sm p-3 border rounded bg-gray-50 resize-none"
              spellCheck={false}
            />
            {stats && (
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="p-2 bg-white rounded border">
                  <div className="text-lg font-bold text-red-600">{stats.originalSize} bytes</div>
                  <div>Original</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <div className="text-lg font-bold text-green-600">{stats.optimizedSize} bytes</div>
                  <div>Optimized</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <div className="text-lg font-bold text-blue-600">{stats.savings}%</div>
                  <div>Reduction</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'options' && (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => selectAllOptions(true)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              Enable All
            </button>
            <button
              onClick={() => selectAllOptions(false)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              Disable All
            </button>
            <button
              onClick={() => setOptions(defaultOptions)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              Reset to Defaults
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {(Object.keys(defaultOptions) as Array<keyof OptimizationOptions>).map(key => (
              <label key={key} className="flex items-start gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={() => toggleOption(key)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-sm">{optionLabels[key]}</div>
                  <div className="text-xs text-gray-500">{optionDescriptions[key]}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'preview' && outputSVG && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                Copy SVG
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                Download
              </button>
            </div>
          </div>
          
          {stats && (
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
              <div className="p-2 bg-white rounded border">
                <div className="text-lg font-bold text-red-600">{stats.originalSize} bytes</div>
                <div>Original</div>
              </div>
              <div className="p-2 bg-white rounded border">
                <div className="text-lg font-bold text-green-600">{stats.optimizedSize} bytes</div>
                <div>Optimized</div>
              </div>
              <div className="p-2 bg-white rounded border">
                <div className="text-lg font-bold text-blue-600">{stats.savings}%</div>
                <div>Reduction</div>
              </div>
            </div>
          )}
          
          <div className="border rounded overflow-hidden bg-white">
            <div
              className="w-full h-96 flex items-center justify-center p-4"
              dangerouslySetInnerHTML={{ __html: outputSVG }}
            />
          </div>
          
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
              Show Optimized SVG Code
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded overflow-x-auto text-xs font-mono max-h-64 overflow-y-auto">
              {outputSVG}
            </pre>
          </details>
        </div>
      )}
      
      {activeTab === 'preview' && !outputSVG && (
        <div className="text-center py-12 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4 5 6-6m-6 0v-4m0 4h12m-12 0V8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-2">Optimize an SVG to see the preview here</p>
        </div>
      )}
    </div>
  );
}