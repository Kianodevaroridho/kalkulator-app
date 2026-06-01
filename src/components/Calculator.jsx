import React, { useState, useEffect, useRef } from 'react';
import { evaluate } from '../utils/mathEval';

export default function Calculator({
  soundEnabled,
  vibrationEnabled,
  isRadian,
  setIsRadian,
  onAddHistory,
  expression,
  setExpression,
  inputValue,
  setInputValue,
  isScientific,
  setIsScientific
}) {
  const displayEndRef = useRef(null);

  // Auto-scroll long expressions in the screen
  useEffect(() => {
    if (displayEndRef.current) {
      displayEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [expression, inputValue]);

  // Audio Synthesizer (Zero asset dependecy beep feedback)
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // High pitch click beep
      gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (err) {
      console.warn('Audio Context unsupported or blocked:', err);
    }
  };

  // Tactile Vibration feedback
  const playHapticVibration = () => {
    if (vibrationEnabled && navigator.vibrate) {
      try {
        navigator.vibrate(15); // short 15ms pulse
      } catch (err) {
        // Suppress errors on devices where vibration is disabled/unsupported
      }
    }
  };

  const handleKeyPress = (key) => {
    playClickSound();
    playHapticVibration();

    // Custom Key handlers
    if (key === 'C') {
      setExpression('');
      setInputValue('0');
      return;
    }

    if (key === 'DEL') {
      if (expression.length > 0) {
        const updated = expression.slice(0, -1);
        setExpression(updated);
        
        // Update input live preview
        if (updated.trim() === '') {
          setInputValue('0');
        } else {
          const preview = evaluate(updated, isRadian);
          if (preview !== 'Error' && preview !== 'Undefined') {
            setInputValue(preview.toString());
          }
        }
      } else {
        setInputValue('0');
      }
      return;
    }

    if (key === '=') {
      if (!expression || expression.trim() === '') return;
      const res = evaluate(expression, isRadian);
      onAddHistory({ expr: expression, res: res.toString() });
      setInputValue(res.toString());
      setExpression(res.toString()); // Allow continuing calculations
      return;
    }

    if (key === '±') {
      // Toggle sign of expression
      if (expression === '') {
        setExpression('-');
        setInputValue('-');
      } else if (expression.startsWith('-(') && expression.endsWith(')')) {
        const unwrapped = expression.slice(2, -1);
        setExpression(unwrapped);
        const preview = evaluate(unwrapped, isRadian);
        setInputValue(preview.toString());
      } else {
        const wrapped = `-(${expression})`;
        setExpression(wrapped);
        const preview = evaluate(wrapped, isRadian);
        setInputValue(preview.toString());
      }
      return;
    }

    if (key === '%') {
      // Percentage conversion
      if (expression !== '') {
        const wrapped = `(${expression})/100`;
        setExpression(wrapped);
        const preview = evaluate(wrapped, isRadian);
        setInputValue(preview.toString());
      }
      return;
    }

    // Append standard digit/operator
    let appendStr = key;
    if (key === 'sin' || key === 'cos' || key === 'tan' || 
        key === 'asin' || key === 'acos' || key === 'atan' || 
        key === 'ln' || key === 'log') {
      appendStr = `${key}(`;
    } else if (key === '√') {
      appendStr = '√(';
    } else if (key === 'xʸ') {
      appendStr = '^';
    } else if (key === 'x!') {
      appendStr = '!';
    } else if (key === '×') {
      appendStr = '×';
    } else if (key === '÷') {
      appendStr = '÷';
    }

    const nextExpression = expression + appendStr;
    setExpression(nextExpression);

    // Live preview updates
    const liveVal = evaluate(nextExpression, isRadian);
    if (liveVal !== 'Error' && liveVal !== 'Undefined') {
      setInputValue(liveVal.toString());
    }
  };

  // Dynamically compute display font size based on characters to prevent text overflow
  const getDynamicFontSize = (text) => {
    const len = text.length;
    if (len < 10) return '3rem';
    if (len < 16) return '2.2rem';
    return '1.5rem';
  };

  // Keyboard mapping grid layouts
  const standardButtons = [
    { label: 'C', type: 'control' },
    { label: '(', type: 'operator' },
    { label: ')', type: 'operator' },
    { label: '÷', type: 'operator' },
    { label: '7', type: 'digit' },
    { label: '8', type: 'digit' },
    { label: '9', type: 'digit' },
    { label: '×', type: 'operator' },
    { label: '4', type: 'digit' },
    { label: '5', type: 'digit' },
    { label: '6', type: 'digit' },
    { label: '-', type: 'operator' },
    { label: '1', type: 'digit' },
    { label: '2', type: 'digit' },
    { label: '3', type: 'digit' },
    { label: '+', type: 'operator' },
    { label: '±', type: 'digit' },
    { label: '0', type: 'digit' },
    { label: '.', type: 'digit' },
    { label: '=', type: 'action' }
  ];

  const scientificButtons = [
    { label: 'Rad', type: 'mode', active: isRadian },
    { label: 'Deg', type: 'mode', active: !isRadian },
    { label: 'x!', type: 'sci' },
    { label: '%', type: 'sci' },
    
    { label: 'sin', type: 'sci' },
    { label: 'cos', type: 'sci' },
    { label: 'tan', type: 'sci' },
    { label: 'xʸ', type: 'sci' },

    { label: 'asin', type: 'sci' },
    { label: 'acos', type: 'sci' },
    { label: 'atan', type: 'sci' },
    { label: '√', type: 'sci' },

    { label: 'ln', type: 'sci' },
    { label: 'log', type: 'sci' },
    { label: 'π', type: 'sci' },
    { label: 'e', type: 'sci' }
  ];

  return (
    <div className="calculator-workspace">
      {/* Display Screen */}
      <div className="calc-screen">
        <div className="expression-row">
          <span>{expression || '0'}</span>
          <div ref={displayEndRef} />
        </div>
        <div 
          className="result-row" 
          style={{ fontSize: getDynamicFontSize(inputValue) }}
        >
          {inputValue}
        </div>
      </div>

      {/* Mode Control Bar */}
      <div className="calc-mode-bar">
        <button 
          className={`mode-toggle-btn ${!isScientific ? 'active' : ''}`}
          onClick={() => { playClickSound(); playHapticVibration(); setIsScientific(false); }}
        >
          Standard
        </button>
        <button 
          className={`mode-toggle-btn ${isScientific ? 'active' : ''}`}
          onClick={() => { playClickSound(); playHapticVibration(); setIsScientific(true); }}
        >
          Scientific
        </button>
      </div>

      {/* Grid Keypads */}
      <div className={`keypads-container ${isScientific ? 'scientific-layout' : 'standard-layout'}`}>
        {isScientific && (
          <div className="sci-keypad">
            {scientificButtons.map((btn, idx) => (
              <button
                key={idx}
                className={`calc-btn btn-sci ${btn.active ? 'btn-active-mode' : ''}`}
                onClick={() => {
                  if (btn.label === 'Rad') {
                    playClickSound(); playHapticVibration(); setIsRadian(true);
                  } else if (btn.label === 'Deg') {
                    playClickSound(); playHapticVibration(); setIsRadian(false);
                  } else {
                    handleKeyPress(btn.label);
                  }
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        <div className="standard-keypad">
          {standardButtons.map((btn, idx) => (
            <button
              key={idx}
              className={`calc-btn btn-${btn.type} ${btn.label === '=' ? 'equals-btn' : ''}`}
              onClick={() => handleKeyPress(btn.label)}
            >
              {btn.label}
            </button>
          ))}
          {/* Backspace is a special layout item in place of some buttons, or we can add it clearly. Let's customize key styling */}
        </div>
      </div>
      
      {/* Quick Utility action bar below calculator */}
      <div className="quick-action-bar">
        <button 
          className="quick-action-btn"
          onClick={() => handleKeyPress('DEL')}
          title="Backspace"
          aria-label="Delete last character"
        >
          Backspace
        </button>
        <button 
          className="quick-action-btn"
          onClick={() => {
            playClickSound();
            playHapticVibration();
            navigator.clipboard.writeText(inputValue);
            alert('Copied to clipboard!');
          }}
          title="Copy Result"
        >
          Copy Result
        </button>
      </div>
    </div>
  );
}
