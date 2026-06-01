import React from 'react';

const themes = [
  { id: 'aurora', name: 'Aurora Glass', primary: '#aa3bff', secondary: '#00f2fe', bg: 'rgba(255, 255, 255, 0.1)' },
  { id: 'obsidian', name: 'Sleek Obsidian', primary: '#f97316', secondary: '#374151', bg: '#1f2937' },
  { id: 'nordic', name: 'Nordic Light', primary: '#3b82f6', secondary: '#e5e7eb', bg: '#f3f4f6' },
  { id: 'cyber', name: 'Cyber Neon', primary: '#ec4899', secondary: '#06b6d4', bg: '#000000' },
  { id: 'terminal', name: 'Retro Terminal', primary: '#22c55e', secondary: '#15803d', bg: '#0a0a0a' }
];

export default function ThemeSelector({ activeTheme, setTheme }) {
  return (
    <div className="theme-selector-container">
      <span className="theme-label">Theme</span>
      <div className="theme-options">
        {themes.map((theme) => (
          <button
            key={theme.id}
            className={`theme-dot ${activeTheme === theme.id ? 'active' : ''}`}
            style={{
              '--theme-primary': theme.primary,
              '--theme-secondary': theme.secondary,
              '--theme-bg': theme.bg
            }}
            onClick={() => setTheme(theme.id)}
            title={theme.name}
            aria-label={`Select ${theme.name} Theme`}
          >
            <span className="theme-preview-dot" />
            <span className="theme-tooltip">{theme.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
