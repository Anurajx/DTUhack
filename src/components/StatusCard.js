import React from 'react';
import './StatusCard.css';

const StatusCard = ({ prediction }) => {
  const { predicted_load, risk } = prediction;

  const getRiskColor = () => {
    switch (risk) {
      case 'HIGH':
        return '#ef4444';
      case 'MEDIUM':
        return '#f59e0b';
      case 'LOW':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getRiskBgColor = () => {
    switch (risk) {
      case 'HIGH':
        return '#fee2e2';
      case 'MEDIUM':
        return '#fef3c7';
      case 'LOW':
        return '#d1fae5';
      default:
        return '#f3f4f6';
    }
  };

  const getRiskMessage = () => {
    switch (risk) {
      case 'HIGH':
        return 'Overload risk';
      case 'MEDIUM':
        return 'Peak building';
      case 'LOW':
        return 'Grid stable';
      default:
        return 'Unknown';
    }
  };

  const maxCapacity = 300;
  const capacityPercent = Math.min((predicted_load / maxCapacity) * 100, 100);

  return (
    <div className="status-card hero-card" style={{ backgroundColor: getRiskBgColor() }}>
      <div className="status-header">
        <h2>AI Predicted Load</h2>
        <div
          className="risk-indicator"
          style={{ backgroundColor: getRiskColor() }}
        >
          {risk}
        </div>
      </div>
      <div className="load-value">
        {predicted_load.toFixed(1)} <span className="load-unit">kW</span>
      </div>
      <div className="status-subtitle">
        Next 1-Hour AI Forecast
      </div>
      <div className="capacity-bar-container">
        <div className="capacity-bar">
          <div 
            className="capacity-fill"
            style={{ 
              width: `${capacityPercent}%`,
              backgroundColor: getRiskColor()
            }}
          />
        </div>
        <div className="capacity-labels">
          <span>0 kW</span>
          <span>{maxCapacity} kW Capacity</span>
        </div>
      </div>
      <div className="risk-message">
        {getRiskMessage()}
      </div>
    </div>
  );
};

export default StatusCard;
