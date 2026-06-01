import React, { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import Converter from './components/Converter';
import ThemeSelector from './components/ThemeSelector';
import HistoryPanel from './components/HistoryPanel';
import './App.css';

export default function App() {
  // PERSISTENT SETTINGS STATE
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('calc_theme') || 'aurora';
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('calc_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    const saved = localStorage.getItem('calc_vibe');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('calc_history');
    return saved !== null ? JSON.parse(saved) : [];
  });

  // RUNTIME VIEW STATES
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'converter'
  const [isScientific, setIsScientific] = useState(false);
  const [isRadian, setIsRadian] = useState(false);
  const [expression, setExpression] = useState('');
  const [inputValue, setInputValue] = useState('0');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('calc_theme', activeTheme);
    // Apply data-theme attribute to html or root body wrapper
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    localStorage.setItem('calc_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('calc_vibe', JSON.stringify(vibrationEnabled));
  }, [vibrationEnabled]);

  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(history));
  }, [history]);

  // Tactile click synthesizer (internal helper)
  const triggerHaptic = () => {
    if (vibrationEnabled && navigator.vibrate) {
      try { navigator.vibrate(15); } catch (e) {}
    }
  };

  const triggerSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
  };

  // Add items to local logs
  const handleAddHistory = (item) => {
    setHistory((prev) => [item, ...prev].slice(0, 50)); // Cap logs at 50 entries
  };

  // Click callbacks from History Panel
  const handleSelectExpression = (expr) => {
    triggerSound();
    triggerHaptic();
    setExpression(expr);
    setIsHistoryOpen(false);
  };

  const handleSelectResult = (res) => {
    triggerSound();
    triggerHaptic();
    setExpression((prev) => prev + res);
    setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
    triggerSound();
    triggerHaptic();
    setHistory([]);
  };

  // PHYSICAL KEYBOARD SUPPORT
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid keyboard interference if user is typing into converter fields
      if (activeTab === 'converter') return;
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') return;

      const key = e.key;

      // Digits & Operators mapping
      if (/^[0-9.]$/.test(key)) {
        e.preventDefault();
        triggerSound();
        triggerHaptic();
        setExpression((prev) => prev + key);
      } else if (key === '+') {
        e.preventDefault();
        triggerSound();
        triggerHaptic();
        setExpression((prev) => prev + '+');
      } else if (key === '-') {
        e.preventDefault();
        triggerSound();
        triggerHaptic();
        setExpression((prev) => prev + '-');
      } else if (key === '*') {
        e.preventDefault();
        triggerSound();
        triggerHaptic();
        setExpression((prev) => prev + '×');
      } else if (key === '/') {
        e.preventDefault();
        triggerSound();
        triggerHaptic();
        setExpression((prev) => prev + '÷');
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        triggerSound();
        triggerHaptic();
        setExpression((prev) => prev + key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        triggerSound();
        triggerHaptic();
        // Trigger calculation click
        const btn = document.querySelector('.equals-btn');
        if (btn) btn.click();
      } else if (key === 'Backspace') {
        e.preventDefault();
        triggerSound();
        triggerHaptic();
        setExpression((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));
      } else if (key === 'Escape') {
        e.preventDefault();
        triggerSound();
        triggerHaptic();
        setExpression('');
        setInputValue('0');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTab, soundEnabled, vibrationEnabled]);

  return (
    <div className="layout-wrapper">
      {/* Visual background aura particles for high-fidelity wow factor */}
      <div className="aura-backdrop aura-cyan"></div>
      <div className="aura-backdrop aura-magenta"></div>

      <div className={`app-container ${isScientific || activeTab === 'converter' ? 'wide' : ''}`}>
        
        {/* Dynamic sliding History drawer */}
        <HistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => { triggerSound(); triggerHaptic(); setIsHistoryOpen(false); }}
          history={history}
          onSelectExpression={handleSelectExpression}
          onSelectResult={handleSelectResult}
          onClearHistory={handleClearHistory}
        />

        {/* Master Control Bar */}
        <div className="app-header">
          {/* View Tab switchers */}
          <div className="mode-pills">
            <button
              className={`pill-btn ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => { triggerSound(); triggerHaptic(); setActiveTab('calculator'); }}
            >
              🔢 Calculator
            </button>
            <button
              className={`pill-btn ${activeTab === 'converter' ? 'active' : ''}`}
              onClick={() => { triggerSound(); triggerHaptic(); setActiveTab('converter'); }}
            >
              🔄 Converter
            </button>
          </div>

          {/* Quick status configurations */}
          <div className="header-controls">
            {/* Audio Toggle */}
            <button
              className={`control-icon-btn ${soundEnabled ? 'active' : ''}`}
              onClick={() => { setSoundEnabled(!soundEnabled); triggerHaptic(); }}
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>

            {/* Haptic Vibration Toggle */}
            <button
              className={`control-icon-btn ${vibrationEnabled ? 'active' : ''}`}
              onClick={() => { triggerSound(); setVibrationEnabled(!vibrationEnabled); }}
              title={vibrationEnabled ? 'Disable Haptics' : 'Enable Haptics'}
              aria-label="Toggle Haptic"
            >
              📳
            </button>

            {/* History Open Trigger */}
            <button
              className={`control-icon-btn ${isHistoryOpen ? 'active' : ''}`}
              onClick={() => { triggerSound(); triggerHaptic(); setIsHistoryOpen(!isHistoryOpen); }}
              title="Calculation History"
              aria-label="Open History Log"
            >
              📜
            </button>
          </div>
        </div>

        {/* Center content panel */}
        {activeTab === 'calculator' ? (
          <Calculator
            soundEnabled={soundEnabled}
            vibrationEnabled={vibrationEnabled}
            isRadian={isRadian}
            setIsRadian={setIsRadian}
            onAddHistory={handleAddHistory}
            expression={expression}
            setExpression={setExpression}
            inputValue={inputValue}
            setInputValue={setInputValue}
            isScientific={isScientific}
            setIsScientific={setIsScientific}
          />
        ) : (
          <Converter />
        )}

        {/* Theme select footer row */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <ThemeSelector activeTheme={activeTheme} setTheme={setActiveTheme} />
        </div>
      </div>

      {/* Decorative branding watermark */}
      <footer className="app-watermark">
        <p>✨ Premium Interactive Workspace</p>
        <span>v2.0.0 // LOCAL EVAL MODE</span>
      </footer>
    </div>
  );
}
