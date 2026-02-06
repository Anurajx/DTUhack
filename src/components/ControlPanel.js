import React from 'react';
import './ControlPanel.css';

const ControlPanel = ({ params, onParamChange }) => {
  const handleChange = (key, value) => {
    onParamChange(key, parseFloat(value) || 0);
  };

  return (
    <div className="control-panel">
      <div className="control-header">
        <h3>🎛️ Load Simulation Controls</h3>
        <p>Adjust parameters to see real-time predictions</p>
      </div>

      <div className="controls-grid">
        <div className="control-item">
          <label>
            Base Load (kW)
            <span className="control-value">{params.current_load.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="50"
            max="300"
            step="5"
            value={params.current_load}
            onChange={(e) => handleChange('current_load', e.target.value)}
            className="control-slider"
          />
          <div className="control-range">50 - 300 kW</div>
        </div>

        <div className="control-item">
          <label>
            Temperature (°C)
            <span className="control-value">{params.temperature.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="15"
            max="40"
            step="0.5"
            value={params.temperature}
            onChange={(e) => handleChange('temperature', e.target.value)}
            className="control-slider"
          />
          <div className="control-range">15°C - 40°C</div>
        </div>

        <div className="control-item">
          <label>
            EVs Charging
            <span className="control-value">{params.ev_count}</span>
          </label>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={params.ev_count}
            onChange={(e) => handleChange('ev_count', e.target.value)}
            className="control-slider"
          />
          <div className="control-range">0 - 15 vehicles</div>
        </div>

        <div className="control-item">
          <label>
            Appliance Load (kW)
            <span className="control-value">{params.appliance_load.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={params.appliance_load}
            onChange={(e) => handleChange('appliance_load', e.target.value)}
            className="control-slider"
          />
          <div className="control-range">0 - 100 kW</div>
        </div>

        <div className="control-item">
          <label>
            AC Usage (%)
            <span className="control-value">{params.ac_usage.toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={params.ac_usage}
            onChange={(e) => handleChange('ac_usage', e.target.value)}
            className="control-slider"
          />
          <div className="control-range">0 - 100%</div>
        </div>

        <div className="control-item">
          <label>
            Heating Usage (%)
            <span className="control-value">{params.heating_usage.toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={params.heating_usage}
            onChange={(e) => handleChange('heating_usage', e.target.value)}
            className="control-slider"
          />
          <div className="control-range">0 - 100%</div>
        </div>

        <div className="control-item">
          <label>
            Time of Day (Hour)
            <span className="control-value">{params.time_of_day}:00</span>
          </label>
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={params.time_of_day}
            onChange={(e) => handleChange('time_of_day', e.target.value)}
            className="control-slider"
          />
          <div className="control-range">0:00 - 23:00</div>
        </div>

        <div className="control-item">
          <label>
            Community Size (Homes)
            <span className="control-value">{params.community_size}</span>
          </label>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={params.community_size}
            onChange={(e) => handleChange('community_size', e.target.value)}
            className="control-slider"
          />
          <div className="control-range">50 - 500 homes</div>
        </div>
      </div>

      <div className="control-footer">
        <button 
          className="reset-button"
          onClick={() => {
            onParamChange('current_load', 100);
            onParamChange('temperature', 25);
            onParamChange('ev_count', 1);
            onParamChange('appliance_load', 0);
            onParamChange('ac_usage', 0);
            onParamChange('heating_usage', 0);
            onParamChange('time_of_day', new Date().getHours());
            onParamChange('community_size', 100);
          }}
        >
          🔄 Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
