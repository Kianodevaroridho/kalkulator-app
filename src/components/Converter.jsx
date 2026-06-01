import React, { useState, useEffect } from 'react';

const CATEGORIES = {
  length: {
    name: 'Length',
    icon: '📏',
    units: [
      { id: 'm', name: 'Meters (m)', baseFactor: 1 },
      { id: 'km', name: 'Kilometers (km)', baseFactor: 1000 },
      { id: 'mi', name: 'Miles (mi)', baseFactor: 1609.344 },
      { id: 'ft', name: 'Feet (ft)', baseFactor: 0.3048 },
      { id: 'in', name: 'Inches (in)', baseFactor: 0.0254 },
    ],
  },
  weight: {
    name: 'Weight / Mass',
    icon: '⚖️',
    units: [
      { id: 'kg', name: 'Kilograms (kg)', baseFactor: 1 },
      { id: 'g', name: 'Grams (g)', baseFactor: 0.001 },
      { id: 'lb', name: 'Pounds (lb)', baseFactor: 0.45359237 },
      { id: 'oz', name: 'Ounces (oz)', baseFactor: 0.028349523125 },
    ],
  },
  temp: {
    name: 'Temperature',
    icon: '🌡️',
    units: [
      { id: 'C', name: 'Celsius (°C)' },
      { id: 'F', name: 'Fahrenheit (°F)' },
      { id: 'K', name: 'Kelvin (K)' },
    ],
  },
  area: {
    name: 'Area',
    icon: '🗺️',
    units: [
      { id: 'm2', name: 'Square Meters (m²)', baseFactor: 1 },
      { id: 'km2', name: 'Square Kilometers (km²)', baseFactor: 1000000 },
      { id: 'mi2', name: 'Square Miles (mi²)', baseFactor: 2589988.110336 },
      { id: 'ac', name: 'Acres (ac)', baseFactor: 4046.8564224 },
    ],
  },
};

export default function Converter() {
  const [activeCategory, setActiveCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [fromVal, setFromVal] = useState('1');
  const [toVal, setToVal] = useState('0.001');

  // Reset defaults when switching category
  useEffect(() => {
    const catData = CATEGORIES[activeCategory];
    const firstUnit = catData.units[0].id;
    const secondUnit = catData.units[1].id;
    setFromUnit(firstUnit);
    setToUnit(secondUnit);
    setFromVal('1');
    triggerConversion('1', firstUnit, secondUnit, activeCategory, 'from');
  }, [activeCategory]);

  const triggerConversion = (value, from, to, cat, sourceDirection) => {
    if (value === '' || isNaN(value)) {
      if (sourceDirection === 'from') {
        setToVal('');
      } else {
        setFromVal('');
      }
      return;
    }

    const numVal = parseFloat(value);
    let result = 0;

    if (cat === 'temp') {
      // Special temperature logic
      if (from === to) {
        result = numVal;
      } else if (from === 'C' && to === 'F') {
        result = (numVal * 9) / 5 + 32;
      } else if (from === 'C' && to === 'K') {
        result = numVal + 273.15;
      } else if (from === 'F' && to === 'C') {
        result = ((numVal - 32) * 5) / 9;
      } else if (from === 'F' && to === 'K') {
        result = ((numVal - 32) * 5) / 9 + 273.15;
      } else if (from === 'K' && to === 'C') {
        result = numVal - 273.15;
      } else if (from === 'K' && to === 'F') {
        result = ((numVal - 273.15) * 9) / 5 + 32;
      }
    } else {
      // Standard multiplier logic
      const units = CATEGORIES[cat].units;
      const fromObj = units.find((u) => u.id === from);
      const toObj = units.find((u) => u.id === to);
      if (fromObj && toObj) {
        // Convert from standard value back
        const valueInBase = numVal * fromObj.baseFactor;
        result = valueInBase / toObj.baseFactor;
      }
    }

    // Round to elegant precision
    const roundedRes = parseFloat(result.toFixed(6)).toString();

    if (sourceDirection === 'from') {
      setToVal(roundedRes);
    } else {
      setFromVal(roundedRes);
    }
  };

  const handleFromValChange = (e) => {
    const val = e.target.value;
    setFromVal(val);
    triggerConversion(val, fromUnit, toUnit, activeCategory, 'from');
  };

  const handleToValChange = (e) => {
    const val = e.target.value;
    setToVal(val);
    triggerConversion(val, toUnit, fromUnit, activeCategory, 'to');
  };

  const handleFromUnitChange = (e) => {
    const newUnit = e.target.value;
    setFromUnit(newUnit);
    triggerConversion(fromVal, newUnit, toUnit, activeCategory, 'from');
  };

  const handleToUnitChange = (e) => {
    const newUnit = e.target.value;
    setToUnit(newUnit);
    triggerConversion(fromVal, fromUnit, newUnit, activeCategory, 'from');
  };

  const swapUnits = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromVal(toVal);
    setToVal(fromVal);
  };

  return (
    <div className="converter-panel">
      {/* Category selector */}
      <div className="converter-tabs">
        {Object.entries(CATEGORIES).map(([id, cat]) => (
          <button
            key={id}
            className={`converter-tab-btn ${activeCategory === id ? 'active' : ''}`}
            onClick={() => setActiveCategory(id)}
          >
            <span className="tab-icon">{cat.icon}</span>
            <span className="tab-name">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Main converter grid */}
      <div className="converter-workspace">
        <div className="converter-box">
          <label>From</label>
          <div className="converter-field">
            <input
              type="number"
              value={fromVal}
              onChange={handleFromValChange}
              placeholder="0"
              className="converter-input"
            />
            <select
              value={fromUnit}
              onChange={handleFromUnitChange}
              className="converter-select"
            >
              {CATEGORIES[activeCategory].units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap button */}
        <button 
          className="swap-units-btn" 
          onClick={swapUnits} 
          title="Swap Units"
          aria-label="Swap units direction"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>

        <div className="converter-box">
          <label>To</label>
          <div className="converter-field">
            <input
              type="number"
              value={toVal}
              onChange={handleToValChange}
              placeholder="0"
              className="converter-input"
            />
            <select
              value={toUnit}
              onChange={handleToUnitChange}
              className="converter-select"
            >
              {CATEGORIES[activeCategory].units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
