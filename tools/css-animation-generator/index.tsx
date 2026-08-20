import { useState, useRef, useEffect } from 'react';

type AnimationType = 'keyframes' | 'transition';
type Easing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier(0.25, 0.1, 0.25, 1)' | 'cubic-bezier(0.42, 0, 0.58, 1)' | 'cubic-bezier(0, 0, 0.58, 1)' | 'cubic-bezier(0.42, 0, 1, 1)';

interface Keyframe {
  offset: number;
  transform: string;
  opacity: number;
  backgroundColor: string;
}

const DEFAULT_KEYFRAMES: Keyframe[] = [
  { offset: 0, transform: 'translateX(0) scale(1)', opacity: 1, backgroundColor: '#3b82f6' },
  { offset: 50, transform: 'translateX(100px) scale(1.2)', opacity: 0.8, backgroundColor: '#8b5cf6' },
  { offset: 100, transform: 'translateX(0) scale(1)', opacity: 1, backgroundColor: '#3b82f6' },
];

const PRESETS = {
  bounce: [
    { offset: 0, transform: 'translateY(0) scale(1)', opacity: 1, backgroundColor: '#3b82f6' },
    { offset: 50, transform: 'translateY(-100px) scale(1.1)', opacity: 1, backgroundColor: '#8b5cf6' },
    { offset: 100, transform: 'translateY(0) scale(1)', opacity: 1, backgroundColor: '#3b82f6' },
  ],
  pulse: [
    { offset: 0, transform: 'scale(1)', opacity: 1, backgroundColor: '#3b82f6' },
    { offset: 50, transform: 'scale(1.2)', opacity: 0.7, backgroundColor: '#8b5cf6' },
    { offset: 100, transform: 'scale(1)', opacity: 1, backgroundColor: '#3b82f6' },
  ],
  spin: [
    { offset: 0, transform: 'rotate(0deg) scale(1)', opacity: 1, backgroundColor: '#3b82f6' },
    { offset: 100, transform: 'rotate(360deg) scale(1)', opacity: 1, backgroundColor: '#3b82f6' },
  ],
  slide: [
    { offset: 0, transform: 'translateX(-150px)', opacity: 0, backgroundColor: '#3b82f6' },
    { offset: 100, transform: 'translateX(0)', opacity: 1, backgroundColor: '#3b82f6' },
  ],
  fade: [
    { offset: 0, transform: 'scale(1)', opacity: 0, backgroundColor: '#3b82f6' },
    { offset: 100, transform: 'scale(1)', opacity: 1, backgroundColor: '#3b82f6' },
  ],
  shake: [
    { offset: 0, transform: 'translateX(0)', opacity: 1, backgroundColor: '#3b82f6' },
    { offset: 20, transform: 'translateX(-10px)', opacity: 1, backgroundColor: '#8b5cf6' },
    { offset: 40, transform: 'translateX(10px)', opacity: 1, backgroundColor: '#ec4899' },
    { offset: 60, transform: 'translateX(-10px)', opacity: 1, backgroundColor: '#8b5cf6' },
    { offset: 80, transform: 'translateX(10px)', opacity: 1, backgroundColor: '#ec4899' },
    { offset: 100, transform: 'translateX(0)', opacity: 1, backgroundColor: '#3b82f6' },
  ],
  flip: [
    { offset: 0, transform: 'rotateY(0deg)', opacity: 1, backgroundColor: '#3b82f6' },
    { offset: 100, transform: 'rotateY(360deg)', opacity: 1, backgroundColor: '#8b5cf6' },
  ],
  morph: [
    { offset: 0, transform: 'scale(1) rotate(0deg)', opacity: 1, backgroundColor: '#3b82f6' },
    { offset: 25, transform: 'scale(1.2) rotate(90deg)', opacity: 0.8, backgroundColor: '#8b5cf6' },
    { offset: 50, transform: 'scale(0.8) rotate(180deg)', opacity: 0.6, backgroundColor: '#ec4899' },
    { offset: 75, transform: 'scale(1.2) rotate(270deg)', opacity: 0.8, backgroundColor: '#10b981' },
    { offset: 100, transform: 'scale(1) rotate(360deg)', opacity: 1, backgroundColor: '#3b82f6' },
  ],
};

export default function CssAnimationGenerator() {
  const [animationType, setAnimationType] = useState<AnimationType>('keyframes');
  const [keyframes, setKeyframes] = useState<Keyframe[]>(DEFAULT_KEYFRAMES);
  const [duration, setDuration] = useState(2000);
  const [delay, setDelay] = useState(0);
  const [iterations, setIterations] = useState('infinite');
  const [direction, setDirection] = useState<'normal' | 'reverse' | 'alternate' | 'alternate-reverse'>('normal');
  const [fillMode, setFillMode] = useState<'none' | 'forwards' | 'backwards' | 'both'>('both');
  const [easing, setEasing] = useState<Easing>('ease-in-out');
  const [playState, setPlayState] = useState<'running' | 'paused'>('running');
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [generatedCss, setGeneratedCss] = useState('');

  const generateCss = () => {
    let css = '';
    
    if (animationType === 'keyframes') {
      const keyframeName = 'custom-animation';
      css += `@keyframes ${keyframeName} {\n`;
      keyframes.forEach((kf) => {
        const offset = keyframes.length === 1 ? '0%, 100%' : `${kf.offset}%`;
        css += `  ${offset} {\n`;
        css += `    transform: ${kf.transform};\n`;
        css += `    opacity: ${kf.opacity};\n`;
        css += `    background-color: ${kf.backgroundColor};\n`;
        css += `  }\n`;
      });
      css += `}\n\n`;
      
      css += `.animated-element {\n`;
      css += `  animation-name: ${keyframeName};\n`;
      css += `  animation-duration: ${duration}ms;\n`;
      css += `  animation-delay: ${delay}ms;\n`;
      css += `  animation-iteration-count: ${iterations};\n`;
      css += `  animation-direction: ${direction};\n`;
      css += `  animation-fill-mode: ${fillMode};\n`;
      css += `  animation-timing-function: ${easing};\n`;
      css += `  animation-play-state: ${playState};\n`;
      css += `  width: 80px;\n`;
      css += `  height: 80px;\n`;
      css += `  border-radius: 12px;\n`;
      css += `  display: flex;\n`;
      css += `  align-items: center;\n`;
      css += `  justify-content: center;\n`;
      css += `  color: white;\n`;
      css += `  font-weight: bold;\n`;
      css += `  font-size: 14px;\n`;
      css += `}\n`;
    } else {
      css += `.animated-element {\n`;
      css += `  width: 80px;\n`;
      css += `  height: 80px;\n`;
      css += `  border-radius: 12px;\n`;
      css += `  background-color: ${keyframes[0]?.backgroundColor || '#3b82f6'};\n`;
      css += `  transform: ${keyframes[0]?.transform || 'translateX(0) scale(1)'};\n`;
      css += `  opacity: ${keyframes[0]?.opacity || 1};\n`;
      css += `  display: flex;\n`;
      css += `  align-items: center;\n`;
      css += `  justify-content: center;\n`;
      css += `  color: white;\n`;
      css += `  font-weight: bold;\n`;
      css += `  font-size: 14px;\n`;
      css += `  transition: all ${duration}ms ${easing} ${delay}ms;\n`;
      css += `}\n\n`;
      css += `.animated-element:hover {\n`;
      const lastKf = keyframes[keyframes.length - 1];
      css += `  transform: ${lastKf?.transform || 'translateX(100px) scale(1.2)'};\n`;
      css += `  opacity: ${lastKf?.opacity || 0.8};\n`;
      css += `  background-color: ${lastKf?.backgroundColor || '#8b5cf6'};\n`;
      css += `}\n`;
    }
    
    setGeneratedCss(css);
    return css;
  };

  useEffect(() => {
    generateCss();
  }, [animationType, keyframes, duration, delay, iterations, direction, fillMode, easing, playState]);

  const addKeyframe = () => {
    const lastKf = keyframes[keyframes.length - 1];
    setKeyframes([...keyframes, {
      offset: 100,
      transform: lastKf.transform,
      opacity: lastKf.opacity,
      backgroundColor: lastKf.backgroundColor,
    }]);
  };

  const removeKeyframe = (index: number) => {
    if (keyframes.length <= 2) return;
    setKeyframes(keyframes.filter((_, i) => i !== index));
  };

  const updateKeyframe = (index: number, field: keyof Keyframe, value: any) => {
    setKeyframes(keyframes.map((kf, i) => i === index ? { ...kf, [field]: value } : kf));
  };

  const loadPreset = (presetKey: keyof typeof PRESETS) => {
    setKeyframes([...PRESETS[presetKey]]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetToDefaults = () => {
    setKeyframes(DEFAULT_KEYFRAMES);
    setDuration(2000);
    setDelay(0);
    setIterations('infinite');
    setDirection('normal');
    setFillMode('both');
    setEasing('ease-in-out');
    setPlayState('running');
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>CSS Animation Generator</h2>
        <p className="tool-desc">Create custom CSS keyframe animations and transitions visually. Export production-ready CSS code.</p>
      </div>

      <div className="tool-grid">
        <div className="controls-panel">
          <div className="control-group">
            <label>Animation Type</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="keyframes"
                  checked={animationType === 'keyframes'}
                  onChange={() => setAnimationType('keyframes')}
                />
                <span>Keyframes</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="transition"
                  checked={animationType === 'transition'}
                  onChange={() => setAnimationType('transition')}
                />
                <span>Transition</span>
              </label>
            </div>
          </div>

          <div className="control-group">
            <label>Presets</label>
            <div className="preset-buttons">
              {Object.keys(PRESETS).map(key => (
                <button
                  key={key}
                  className="preset-btn"
                  onClick={() => loadPreset(key as keyof typeof PRESETS)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>Duration: {duration}ms</label>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="control-group">
            <label>Delay: {delay}ms</label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={delay}
              onChange={e => setDelay(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="control-group">
            <label>Iterations</label>
            <select value={iterations} onChange={e => setIterations(e.target.value)} className="select">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="infinite">Infinite</option>
            </select>
          </div>

          <div className="control-group">
            <label>Direction</label>
            <select value={direction} onChange={e => setDirection(e.target.value as any)} className="select">
              <option value="normal">Normal</option>
              <option value="reverse">Reverse</option>
              <option value="alternate">Alternate</option>
              <option value="alternate-reverse">Alternate Reverse</option>
            </select>
          </div>

          <div className="control-group">
            <label>Fill Mode</label>
            <select value={fillMode} onChange={e => setFillMode(e.target.value as any)} className="select">
              <option value="none">None</option>
              <option value="forwards">Forwards</option>
              <option value="backwards">Backwards</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="control-group">
            <label>Easing</label>
            <select value={easing} onChange={e => setEasing(e.target.value as any)} className="select">
              <option value="linear">Linear</option>
              <option value="ease">Ease</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In Out</option>
              <option value="cubic-bezier(0.25, 0.1, 0.25, 1)">Custom Ease Out</option>
              <option value="cubic-bezier(0.42, 0, 0.58, 1)">Custom Ease In</option>
              <option value="cubic-bezier(0, 0, 0.58, 1)">Custom Ease In Out</option>
              <option value="cubic-bezier(0.42, 0, 1, 1)">Custom Bounce</option>
            </select>
          </div>

          <div className="control-group">
            <label>Play State</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="running"
                  checked={playState === 'running'}
                  onChange={() => setPlayState('running')}
                />
                <span>Running</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="paused"
                  checked={playState === 'paused'}
                  onChange={() => setPlayState('paused')}
                />
                <span>Paused</span>
              </label>
            </div>
          </div>

          <div className="action-buttons">
            <button className="copy-btn" onClick={copyToClipboard}>
              {copied ? '✓ Copied!' : 'Copy CSS'}
            </button>
            <button className="reset-btn" onClick={resetToDefaults}>Reset</button>
          </div>
        </div>

        <div className="preview-panel">
          <h3>Preview</h3>
          <div className="preview-container">
            <div
              ref={previewRef}
              className="animated-element"
              style={{
                animationPlayState: playState,
              }}
            >
              {animationType === 'keyframes' ? '▶' : '⟳'}
            </div>
          </div>
          
          <div className="keyframes-editor">
            <h4>Keyframes</h4>
            {keyframes.map((kf, index) => (
              <div key={index} className="keyframe-row">
                <div className="keyframe-header">
                  <span className="keyframe-index">{index + 1}</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={kf.offset}
                    onChange={e => updateKeyframe(index, 'offset', Number(e.target.value))}
                    className="offset-input"
                  />
                  <span>%</span>
                  {keyframes.length > 2 && (
                    <button className="remove-btn" onClick={() => removeKeyframe(index)} title="Remove">✕</button>
                  )}
                </div>
                <div className="keyframe-fields">
                  <div className="field">
                    <label>Transform</label>
                    <input
                      type="text"
                      value={kf.transform}
                      onChange={e => updateKeyframe(index, 'transform', e.target.value)}
                      className="field-input"
                    />
                  </div>
                  <div className="field">
                    <label>Opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={kf.opacity}
                      onChange={e => updateKeyframe(index, 'opacity', Number(e.target.value))}
                      className="slider"
                    />
                    <span className="value-display">{kf.opacity}</span>
                  </div>
                  <div className="field">
                    <label>Color</label>
                    <input
                      type="color"
                      value={kf.backgroundColor}
                      onChange={e => updateKeyframe(index, 'backgroundColor', e.target.value)}
                      className="color-input"
                    />
                    <input
                      type="text"
                      value={kf.backgroundColor}
                      onChange={e => updateKeyframe(index, 'backgroundColor', e.target.value)}
                      className="color-text-input"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="add-keyframe-btn" onClick={addKeyframe}>+ Add Keyframe</button>
          </div>
        </div>
      </div>

      <div className="output-panel">
        <h3>Generated CSS</h3>
        <pre className="css-output"><code>{generatedCss}</code></pre>
      </div>
    </div>
  );
}