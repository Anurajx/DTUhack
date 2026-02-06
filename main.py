from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import os
from datetime import datetime

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CSV data
CSV_FILE = "energy_data.csv"

def load_data():
    if os.path.exists(CSV_FILE):
        return pd.read_csv(CSV_FILE)
    return pd.DataFrame()

# Request models
class PredictionParams(BaseModel):
    current_load: Optional[float] = None
    temperature: Optional[float] = None
    ev_count: Optional[int] = None
    appliance_load: Optional[float] = None
    ac_usage: Optional[float] = None
    heating_usage: Optional[float] = None
    time_of_day: Optional[int] = None
    community_size: Optional[int] = None


class ForecastResponseItem(BaseModel):
    hour_offset: int
    time_of_day: int
    predicted_load: float
    risk: str


class NotifyRequest(BaseModel):
    params: PredictionParams
    predicted_load: float
    risk: str

@app.get("/data")
async def get_data():
    df = load_data()
    if df.empty:
        return {"data": []}
    # Return last 24 rows
    last_24 = df.tail(24).to_dict('records')
    return {"data": last_24}

@app.post("/predict")
async def predict(params: PredictionParams):
    df = load_data()
    
    # Get base values from CSV if not provided
    if df.empty:
        base_load = params.current_load or 100.0
        temperature = params.temperature or 25.0
        ev_charging = params.ev_count or 1
    else:
        last_row = df.iloc[-1]
        base_load = params.current_load if params.current_load is not None else last_row['load_kw']
        temperature = params.temperature if params.temperature is not None else last_row['temperature']
        ev_charging = params.ev_count if params.ev_count is not None else int(last_row['ev_charging'])
    
    # Get additional parameters with defaults
    appliance_load = params.appliance_load or 0.0
    ac_usage = params.ac_usage or 0.0
    heating_usage = params.heating_usage or 0.0
    time_of_day = params.time_of_day if params.time_of_day is not None else datetime.now().hour
    community_size = params.community_size or 100
    
    # Time of day factor (peak hours 18-22 have higher multiplier)
    if 18 <= time_of_day < 22:
        time_factor = 1.3
    elif 6 <= time_of_day < 9:
        time_factor = 1.1
    else:
        time_factor = 0.9
    
    # Community size factor (normalize to base 100)
    community_factor = community_size / 100.0
    
    # Temperature effect on AC/heating
    temp_effect = 0
    if temperature > 28:
        temp_effect = (temperature - 28) * 2  # AC usage increases
    elif temperature < 20:
        temp_effect = (20 - temperature) * 1.5  # Heating usage increases
    
    # Enhanced prediction formula
    base_prediction = 0.6 * base_load
    temp_component = 0.3 * temperature
    ev_component = 25 * ev_charging
    appliance_component = appliance_load * 1.2
    ac_component = ac_usage * 0.8 + temp_effect * 0.5
    heating_component = heating_usage * 0.7
    
    predicted_load = (
        base_prediction + 
        temp_component + 
        ev_component + 
        appliance_component + 
        ac_component + 
        heating_component
    ) * time_factor * community_factor
    
    predicted_load = round(predicted_load, 2)
    
    # Risk levels
    if predicted_load < 200:
        risk = "LOW"
    elif predicted_load <= 260:
        risk = "MEDIUM"
    else:
        risk = "HIGH"
    
    return {
        "predicted_load": predicted_load,
        "risk": risk,
        "components": {
            "base_load": round(base_prediction, 2),
            "temperature": round(temp_component, 2),
            "ev_charging": round(ev_component, 2),
            "appliances": round(appliance_component, 2),
            "ac_heating": round(ac_component + heating_component, 2),
            "time_factor": round(time_factor, 2),
            "community_factor": round(community_factor, 2)
        }
    }

@app.get("/predict")
async def predict_get():
    """Fallback GET endpoint using CSV data"""
    df = load_data()
    if df.empty:
        return {"predicted_load": 0, "risk": "LOW"}
    
    last_row = df.iloc[-1]
    current_load = last_row['load_kw']
    temperature = last_row['temperature']
    ev_charging = int(last_row['ev_charging'])
    
    predicted_load = 0.6 * current_load + 0.3 * temperature + 25 * ev_charging
    predicted_load = round(predicted_load, 2)
    
    if predicted_load < 200:
        risk = "LOW"
    elif predicted_load <= 260:
        risk = "MEDIUM"
    else:
        risk = "HIGH"
    
    return {
        "predicted_load": predicted_load,
        "risk": risk
    }

@app.post("/recommendation")
async def get_recommendation(params: PredictionParams):
    # Get prediction first
    prediction_result = await predict(params)
    predicted_load = prediction_result["predicted_load"]
    risk = prediction_result["risk"]
    
    # Enhanced recommendations based on risk and components
    if predicted_load > 260:
        recommendation = "Delay EV charging and shift heavy appliance use to off-peak hours. Consider reducing AC usage during peak times."
    elif predicted_load >= 200:
        recommendation = "Avoid running multiple heavy appliances together. Schedule EV charging for off-peak hours."
    else:
        recommendation = "Usage is optimal. Grid is stable and efficient."
    
    # Add specific advice based on components
    if params.ac_usage and params.ac_usage > 50:
        recommendation += " High AC usage detected - consider raising thermostat by 2°C."
    if params.ev_count and params.ev_count > 5:
        recommendation += " Multiple EVs charging - stagger charging times."
    
    return {"recommendation": recommendation}

@app.get("/recommendation")
async def get_recommendation_get():
    """Fallback GET endpoint"""
    df = load_data()
    if df.empty:
        return {"recommendation": "Usage is optimal."}
    
    last_row = df.iloc[-1]
    current_load = last_row['load_kw']
    temperature = last_row['temperature']
    ev_charging = int(last_row['ev_charging'])
    
    predicted_load = 0.6 * current_load + 0.3 * temperature + 25 * ev_charging
    
    if predicted_load > 260:
        recommendation = "Delay EV charging and shift heavy appliance use to off-peak hours."
    elif predicted_load >= 200:
        recommendation = "Avoid running multiple heavy appliances together."
    else:
        recommendation = "Usage is optimal."
    
    return {"recommendation": recommendation}


@app.post("/forecast", response_model=List[ForecastResponseItem])
async def forecast(params: PredictionParams):
    """Return forecast for now and next 3 hours based on current parameters."""
    base_hour = params.time_of_day if params.time_of_day is not None else datetime.now().hour
    forecasts: List[ForecastResponseItem] = []

    for offset in range(0, 4):
        hour = (base_hour + offset) % 24
        local_params = PredictionParams(
            **{
                **{k: v for k, v in params.dict().items() if v is not None},
                "time_of_day": hour,
            }
        )
        result = await predict(local_params)
        forecasts.append(
            ForecastResponseItem(
                hour_offset=offset,
                time_of_day=hour,
                predicted_load=result["predicted_load"],
                risk=result["risk"],
            )
        )

    return forecasts


@app.post("/notify")
async def notify_customers(payload: NotifyRequest):
    """Simulate sending alerts/emails to customers based on current risk."""
    notified_count = max(1, int((payload.params.community_size or 100) * 0.8))
    timestamp = datetime.utcnow().isoformat() + "Z"

    return {
        "status": "sent",
        "risk": payload.risk,
        "predicted_load": payload.predicted_load,
        "notified_customers": notified_count,
        "timestamp": timestamp,
    }


@app.get("/")
async def root():
    return {"message": "GreenGrid API is running"}
