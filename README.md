# GreenGrid - AI-Driven Energy Optimization

## Setup Instructions

### 1. Generate Dataset
```bash
pip install pandas
python generate_data.py
```

### 2. Start Backend
```bash
pip install fastapi uvicorn pandas
uvicorn main:app --reload
```

### 3. Start Frontend
```bash
npm install axios chart.js react-chartjs-2
npm start
```

Backend runs on: http://localhost:8000
Frontend runs on: http://localhost:3000
