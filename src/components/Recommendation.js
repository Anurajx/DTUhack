import React from 'react';
import './Recommendation.css';

const Recommendation = ({ recommendation, prediction }) => {
  const { predicted_load, risk } = prediction || { predicted_load: 0, risk: 'LOW' };
  
  // Calculate impact metrics
  const calculateImpact = () => {
    if (risk === 'HIGH') {
      const potentialReduction = predicted_load - 200;
      return {
        moneySaved: (potentialReduction * 0.12 * 30).toFixed(0), // $0.12/kWh, 30 days
        loadReduced: potentialReduction.toFixed(1),
        emissionsReduced: (potentialReduction * 0.5 * 30).toFixed(0) // kg CO2
      };
    } else if (risk === 'MEDIUM') {
      return {
        moneySaved: (15 * 30).toFixed(0),
        loadReduced: '15.0',
        emissionsReduced: (7.5 * 30).toFixed(0)
      };
    } else {
      return {
        moneySaved: '0',
        loadReduced: '0.0',
        emissionsReduced: '0'
      };
    }
  };

  const impact = calculateImpact();

  return (
    <div className="recommendation-card">
      <div className="recommendation-header">
        <h2>💡 Smart Recommendation</h2>
      </div>
      <div className="recommendation-text">
        {recommendation || 'Usage is optimal.'}
      </div>
      {risk !== 'LOW' && (
        <div className="impact-metrics">
          <div className="impact-item">
            <div className="impact-value">${impact.moneySaved}</div>
            <div className="impact-label">Monthly Savings</div>
          </div>
          <div className="impact-item">
            <div className="impact-value">{impact.loadReduced} kW</div>
            <div className="impact-label">Load Reduced</div>
          </div>
          <div className="impact-item">
            <div className="impact-value">{impact.emissionsReduced} kg</div>
            <div className="impact-label">CO₂ Reduced</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendation;
