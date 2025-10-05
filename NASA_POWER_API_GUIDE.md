# 🚀 NASA POWER API Integration Guide

## Overview

The BrahmaXplorers WeatherApp now integrates with NASA's POWER (Prediction of Worldwide Energy Resources) API, providing access to high-quality weather and climate data from NASA's Earth observation satellites and models.

## 🌍 NASA POWER API Features

### Available Data Parameters
- **PRECTOT**: Total precipitation (mm/day)
- **T2M**: Air temperature at 2 meters (°C)
- **RH2M**: Relative humidity at 2 meters (%)
- **WS2M**: Wind speed at 2 meters (m/s)

### API Endpoints

#### 1. Main Weather Endpoint (with NASA fallback)
```
GET /api/weather?city=<city>&lat=<latitude>&lon=<longitude>
```

**Features:**
- Primary: NASA POWER API
- Fallback: Open-Meteo API
- Final fallback: Generated data
- Automatic data source detection
- Database logging

#### 2. NASA Current Weather
```
GET /api/weather/nasa/current?lat=<latitude>&lon=<longitude>
```

**Response:**
```json
{
  "success": true,
  "source": "NASA POWER",
  "location": { "lat": 18.5204, "lon": 73.8567 },
  "data": {
    "source": "NASA POWER",
    "location": { "lat": 18.5204, "lon": 73.8567 },
    "temperature": 25.5,
    "humidity": 65.2,
    "windSpeed": 3.2,
    "precipitation": 0.0,
    "date": "2024-01-15",
    "rainChance": 15
  }
}
```

#### 3. NASA Historical Data
```
GET /api/weather/nasa/historical?lat=<latitude>&lon=<longitude>&startDate=<YYYY-MM-DD>&endDate=<YYYY-MM-DD>
```

**Response:**
```json
{
  "success": true,
  "source": "NASA POWER",
  "location": { "lat": 18.5204, "lon": 73.8567 },
  "dateRange": { "start": "2024-01-01", "end": "2024-01-31" },
  "data": [
    {
      "date": "20240101",
      "dateFormatted": "2024-01-01",
      "precipitation": 0.0,
      "temperature": 24.5,
      "humidity": 68.2,
      "windSpeed": 2.8
    }
  ],
  "totalRecords": 31
}
```

## 🔧 Implementation Details

### NASA POWER API URL Structure
```
https://power.larc.nasa.gov/api/temporal/{temporal}/point?
parameters={params}&
community={community}&
longitude={lon}&
latitude={lat}&
start={start}&
end={end}&
format=JSON
```

### Key Components
- **temporal**: DAILY, MONTHLY, CLIMATOLOGY
- **parameters**: PRECTOT,T2M,RH2M,WS2M
- **community**: SB (agriculture), RE (renewable energy)
- **coordinates**: Latitude and longitude
- **date range**: YYYYMMDD format

### Example NASA POWER URL
```
https://power.larc.nasa.gov/api/temporal/daily/point?
parameters=PRECTOT,T2M,RH2M,WS2M&
community=SB&
longitude=73.8567&
latitude=18.5204&
start=20240101&
end=20240131&
format=JSON
```

## 🛠️ Utility Functions

### `fetchNASAWeather(lat, lon, start, end, temporal, community)`
- Fetches raw NASA POWER data
- Converts to standardized format
- Handles errors gracefully

### `getCurrentNASAWeather(lat, lon)`
- Gets last 7 days of data
- Returns most recent values
- Calculates rain chance from precipitation

### `getHistoricalNASAWeather(lat, lon, startDate, endDate)`
- Fetches historical data for date range
- Returns formatted time series data

## 🎨 Frontend Integration

### Enhanced Weather Card
- **Data Source Indicator**: Shows NASA POWER, Open-Meteo, or Fallback
- **Color-coded Sources**: 
  - 🚀 NASA POWER: Blue-purple gradient
  - 🌤️ Open-Meteo: Green-blue gradient
  - ⚠️ Fallback: Yellow-orange gradient
- **Additional Metrics**: Wind speed, data date
- **Responsive Design**: Grid layout with color-coded metrics

### Data Source Priority
1. **NASA POWER API** (Primary)
2. **Open-Meteo API** (Fallback)
3. **Generated Data** (Final fallback)

## 📊 Database Integration

### WeatherQuery Model
```prisma
model WeatherQuery {
  id          Int      @id @default(autoincrement())
  location    String
  date        DateTime
  temperature Float?
  humidity    Float?
  windSpeed   Float?
  createdAt   DateTime @default(now())
}
```

### Logging Features
- All weather queries logged to database
- Source tracking (NASA, Open-Meteo, Fallback)
- Historical data retrieval
- Performance monitoring

## 🚀 Usage Examples

### Frontend (React)
```javascript
// Fetch weather with automatic source selection
const response = await API.get(`/weather?city=Pune&lat=18.5204&lon=73.8567`);
const weatherData = response.data;

// Check data source
console.log(`Data from: ${weatherData.source}`); // "NASA POWER", "Open-Meteo", or "Fallback"
```

### Direct NASA API Calls
```javascript
// Get current NASA weather
const nasaCurrent = await API.get('/weather/nasa/current?lat=18.5204&lon=73.8567');

// Get historical NASA data
const nasaHistory = await API.get('/weather/nasa/historical?lat=18.5204&lon=73.8567&startDate=2024-01-01&endDate=2024-01-31');
```

## 🔍 Testing

### Test NASA POWER API Directly
```bash
# Test current weather
curl "http://localhost:5000/api/weather/nasa/current?lat=18.5204&lon=73.8567"

# Test historical data
curl "http://localhost:5000/api/weather/nasa/historical?lat=18.5204&lon=73.8567&startDate=2024-01-01&endDate=2024-01-07"

# Test main endpoint (with fallbacks)
curl "http://localhost:5000/api/weather?city=Pune&lat=18.5204&lon=73.8567"
```

### Expected Response Times
- **NASA POWER API**: 2-5 seconds
- **Open-Meteo API**: 1-2 seconds
- **Fallback Data**: <100ms

## 🌟 Benefits of NASA POWER Integration

1. **High-Quality Data**: NASA's satellite and model data
2. **Global Coverage**: Worldwide weather data
3. **Historical Data**: Decades of historical records
4. **Multiple Parameters**: Temperature, humidity, precipitation, wind
5. **Reliability**: Robust fallback system
6. **Free Access**: No API key required
7. **Real-time Updates**: Daily data updates

## 🔮 Future Enhancements

- [ ] Solar radiation data (RSDS)
- [ ] Atmospheric pressure (PS)
- [ ] Cloud cover data
- [ ] Data visualization charts
- [ ] Weather alerts and notifications
- [ ] Climate trend analysis
- [ ] Agricultural weather insights

## 📚 NASA POWER API Documentation

- **Official Documentation**: https://power.larc.nasa.gov/docs/
- **API Reference**: https://power.larc.nasa.gov/docs/api/
- **Data Parameters**: https://power.larc.nasa.gov/docs/datasets/
- **Community Guidelines**: https://power.larc.nasa.gov/docs/community/

---

**🚀 Powered by NASA Earth Data for Accurate Weather Forecasting!**
