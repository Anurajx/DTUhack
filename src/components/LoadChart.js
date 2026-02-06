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

const LoadChart = ({ prediction, forecast }) => {
  const baseLoad = prediction?.predicted_load || 0;

  const points = [
    { label: 'Now', value: baseLoad, risk: prediction?.risk || 'LOW' },
    { label: '+1h', value: forecast?.[1]?.predicted_load || baseLoad, risk: forecast?.[1]?.risk || prediction?.risk || 'LOW' },
    { label: '+2h', value: forecast?.[2]?.predicted_load || baseLoad, risk: forecast?.[2]?.risk || prediction?.risk || 'LOW' },
    { label: '+3h', value: forecast?.[3]?.predicted_load || baseLoad, risk: forecast?.[3]?.risk || prediction?.risk || 'LOW' },
  ];

  const getColorForRisk = (risk) => {
    if (risk === 'HIGH') return '#ef4444';
    if (risk === 'MEDIUM') return '#f59e0b';
    return '#10b981';
  };

  const chartData = {
    labels: points.map(p => p.label),
    datasets: [
      {
        label: 'Forecast Load (kW)',
        data: points.map(p => p.value),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointRadius: (context) => {
          const index = context.dataIndex;
          if (index === 0) return 8; // Now
          return 6; // Future hours
        },
        pointBackgroundColor: (context) => {
          const index = context.dataIndex;
          return getColorForRisk(points[index].risk);
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
            if (index === 0) {
              label += ' (Now)';
            } else {
              label += ` (Forecast +${index}h)`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(baseLoad * 1.5, 320),
        title: {
          display: true,
          text: 'Load (kW)',
          font: {
            size: 13,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.15)',
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
      <div className="chart-subtitle">3-Hour AI Grid Forecast</div>
      <div style={{ height: '350px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LoadChart;
