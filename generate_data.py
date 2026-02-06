import pandas as pd
import random
from datetime import datetime, timedelta

# Generate 7 days of hourly data (168 hours)
hours = list(range(168))
loads = []
temperatures = []
ev_chargings = []

base_date = datetime(2024, 1, 1, 0, 0)

for hour in hours:
    # Temperature: random between 20-35°C
    temp = random.uniform(20, 35)
    temperatures.append(round(temp, 1))
    
    # EV charging: random 0 or 1
    ev_charging = random.choice([0, 1])
    ev_chargings.append(ev_charging)
    
    # Load: simulate morning low, evening peak
    hour_of_day = hour % 24
    
    if 6 <= hour_of_day < 9:  # Morning
        base_load = random.uniform(80, 120)
    elif 9 <= hour_of_day < 18:  # Daytime
        base_load = random.uniform(100, 150)
    elif 18 <= hour_of_day < 22:  # Evening peak
        base_load = random.uniform(180, 280)
    else:  # Night
        base_load = random.uniform(60, 100)
    
    # Add temperature effect
    load = base_load + (temp - 25) * 2
    
    # Add EV charging effect
    if ev_charging == 1:
        load += random.uniform(30, 50)
    
    loads.append(round(load, 2))

# Create DataFrame
df = pd.DataFrame({
    'hour': hours,
    'load_kw': loads,
    'temperature': temperatures,
    'ev_charging': ev_chargings
})

# Save to CSV
df.to_csv('energy_data.csv', index=False)
print("energy_data.csv generated successfully with 168 hours of data")
