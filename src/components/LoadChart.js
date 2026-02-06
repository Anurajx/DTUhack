import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LoadChart = ({ data, prediction }) => {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const labels = data.map((item, index) => {
    if (index === data.length - 1) return 'Current';
    return `H${item.hour || index}`;
  });
  
  const loadValues = data.map(item => item.load_kw);
  
  // Add prediction point
  const extendedLabels = [...labels, 'Prediction'];
  const extendedValues = [...loadValues, prediction?.predicted_load || 0];

  const chartData = {
    labels: extendedLabels,
    datasets: [
      {
        label: 'Load (kW)',
        data: extendedValues,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.15)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: (context) => {
          const index = context.dataIndex;
          if (index === data.length - 1) return 8;
          if (index === extendedLabels.length - 1) return 8;
          return 4;
        },
        pointBackgroundColor: (context) => {
          const index = context.dataIndex;
          if (index === data.length - 1) return '#10b981';
          if (index === extendedLabels.length - 1) return '#f59e0b';
          return '#667eea';
        },
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            let label = `Load: ${context.parsed.y.toFixed(1)} kW`;
            if (index === data.length - 1) {
              label += ' (Current)';
            } else if (index === extendedLabels.length - 1) {
              label += ' (AI Prediction)';
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Load (kW)',
          font: {
            size: 13,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
          font: {
            size: 13,
            weight: 'bold',
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-subtitle">Community Load Trend (Last 24 Hours)</div>
      <div style={{ height: '350px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LoadChart;
