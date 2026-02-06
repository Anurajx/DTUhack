import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import LoadChart from './components/LoadChart';
import StatusCard from './components/StatusCard';
import Recommendation from './components/Recommendation';
import ControlPanel from './components/ControlPanel';
import './App.css';

const API_URL = 'http://localhost:8000';

function App() {
  const [loadData, setLoadData] = useState([]);
  const [prediction, setPrediction] = useState({ predicted_load: 0, risk: 'LOW', components: {} });
  const [recommendation, setRecommendation] = useState({ recommendation: '' });
  const [loading, setLoading] = useState(true);
  const [aiActive, setAIActive] = useState(true);
  
  const [params, setParams] = useState({
    current_load: 100,
    temperature: 25,
    ev_count: 1,
    appliance_load: 0,
    ac_usage: 0,
    heating_usage: 0,
    time_of_day: new Date().getHours(),
    community_size: 100
  });

  const fetchHistoricalData = async () => {
    try {
      const dataRes = await axios.get(`${API_URL}/data`);
      setLoadData(dataRes.data.data || []);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const fetchPrediction = useCallback(async () => {
    try {
      const predictRes = await axios.post(`${API_URL}/predict`, params);
      setPrediction(predictRes.data);
      setAIActive(true);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      setAIActive(false);
    }
  }, [params]);

  const fetchRecommendation = useCallback(async () => {
    try {
      const recRes = await axios.post(`${API_URL}/recommendation`, params);
      setRecommendation(recRes.data);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
    }
  }, [params]);

  const handleParamChange = (key, value) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Fetch prediction and recommendation when params change
  useEffect(() => {
    fetchPrediction();
    fetchRecommendation();
  }, [fetchPrediction, fetchRecommendation]);

  // Fetch historical data on mount and periodically
  useEffect(() => {
    const initData = async () => {
      await fetchHistoricalData();
      await fetchPrediction();
      await fetchRecommendation();
      setLoading(false);
    };
    initData();
    const interval = setInterval(fetchHistoricalData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <h1 style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <header>
          <div className="header-top">
            <div>
              <h1>⚡ GreenGrid</h1>
              <p>AI-Driven Energy Optimization for Residential Communities</p>
            </div>
            <div className="ai-status">
              <span className={`ai-indicator ${aiActive ? 'active' : ''}`}>🟢</span>
              <span>AI Forecast Engine Active</span>
            </div>
          </div>
        </header>

        <div className="dashboard">
          <div className="hero-section">
            <StatusCard prediction={prediction} />
            <ControlPanel params={params} onParamChange={handleParamChange} />
          </div>

          <div className="context-section">
            <div className="chart-section">
              <LoadChart data={loadData} prediction={prediction} />
            </div>
            <Recommendation recommendation={recommendation.recommendation} prediction={prediction} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
