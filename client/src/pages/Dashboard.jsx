import React, { useState, useEffect } from "react";
import API from "../api";
import WeatherCard from "../components/WeatherCard";
import ProbabilityChart from "../components/ProbabilityChart";
import DataDownload from "../components/DataDownload";

export default function Dashboard() {
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedVariables, setSelectedVariables] = useState([
    "temperature", "humidity", "precipitation", "windSpeed"
  ]);
  const [weatherData, setWeatherData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [probabilityData, setProbabilityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // User-defined thresholds (overrides defaults in weatherVariables)
  const [thresholds, setThresholds] = useState({
    temperature: 35,
    humidity: 80,
    precipitation: 10,
    windSpeed: 25,
    airQuality: 100
  });
  // Auto thresholds (percentile-based)
  const [useAutoThresholds, setUseAutoThresholds] = useState(false);
  const [autoThresholdValues, setAutoThresholdValues] = useState({});
  // Seasonal mode (use a window around Day-of-Year)
  const [useSeasonalWindow, setUseSeasonalWindow] = useState(true);
  const seasonalWindowDays = 30; // +/- window

  // Weather variable options
  const weatherVariables = [
    { id: "temperature", name: "Temperature", unit: "°C", threshold: 35 },
    { id: "humidity", name: "Humidity", unit: "%", threshold: 80 },
    { id: "precipitation", name: "Precipitation", unit: "mm", threshold: 10 },
    { id: "windSpeed", name: "Wind Speed", unit: "km/h", threshold: 25 },
    { id: "airQuality", name: "Air Quality Index", unit: "AQI", threshold: 100 }
  ];
  const allVariableIds = weatherVariables.map(v => v.id);

  // Get current date for default
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    setSelectedDate(dayOfYear.toString());
  }, []);

  // Recalculate probabilities whenever selections or historical dataset changes
  useEffect(() => {
    if (!historicalData || historicalData.length === 0) return;
    if (useAutoThresholds) {
      const base = getDatasetForStats(historicalData);
      setAutoThresholdValues(computeAutoThresholds(base));
    }
    const varsToUse = (selectedVariables && selectedVariables.length > 0)
      ? selectedVariables
      : allVariableIds.filter(id => ["temperature","humidity","precipitation","windSpeed"].includes(id));
    const dataset = getDatasetForStats(historicalData);
    const probabilities = calculateProbabilities(dataset, varsToUse, weatherVariables);
    setProbabilityData(probabilities);
  }, [historicalData, selectedVariables, useAutoThresholds]);

  const handleVariableToggle = (variableId) => {
    setSelectedVariables(prev => 
      prev.includes(variableId) 
        ? prev.filter(v => v !== variableId)
        : [...prev, variableId]
    );
  };

  const fetchWeatherAnalysis = async () => {
    if (!location && (!latitude || !longitude)) {
      setError("Please provide either a city name or coordinates");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch current weather
      const currentResponse = await API.get(`/weather?city=${location}&lat=${latitude}&lon=${longitude}`);
      setWeatherData(currentResponse.data);

      // Fetch historical data for probability analysis
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1); // Last year

      const historicalResponse = await API.get(
        `/weather/nasa/historical?lat=${latitude || 18.5204}&lon=${longitude || 73.8567}&startDate=${startDate.toISOString().slice(0, 10)}&endDate=${endDate.toISOString().slice(0, 10)}`
      );

      if (historicalResponse.data && historicalResponse.data.success && Array.isArray(historicalResponse.data.data)) {
        setHistoricalData(historicalResponse.data.data);
        
        // Calculate probability analysis
        const varsToUse = (selectedVariables && selectedVariables.length > 0)
          ? selectedVariables
          : allVariableIds.filter(id => ["temperature","humidity","precipitation","windSpeed"].includes(id));
        const probabilities = calculateProbabilities(historicalResponse.data.data, varsToUse, weatherVariables);
        setProbabilityData(probabilities);
      } else {
        console.warn("Historical API returned no data", historicalResponse.data);
        setHistoricalData([]);
        setProbabilityData(null);
        setError("No historical NASA data returned for this location/date range.");
      }

    } catch (error) {
      console.error("Error fetching weather analysis:", error);
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateProbabilities = (data, variables, variableConfigs) => {
    const probabilities = {};
    
    variables.forEach(variable => {
      const config = variableConfigs.find(v => v.id === variable);
      if (!config) return;

      const values = data.map(d => {
        switch (variable) {
          case "temperature": return Number(d.temperature);
          case "humidity": return Number(d.humidity);
          case "precipitation": return Number(d.precipitation);
          case "windSpeed": return Number(d.windSpeed);
          default: return null;
        }
      }).filter(v => v !== null && v !== undefined);

      if (values.length > 0) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const threshold = useAutoThresholds
          ? Number(autoThresholdValues[variable] ?? config.threshold)
          : Number(thresholds[variable] ?? config.threshold);
        const exceedanceCount = values.filter(v => v > threshold).length;
        const exceedanceProbability = (exceedanceCount / values.length) * 100;

        probabilities[variable] = {
          mean,
          threshold,
          exceedanceProbability,
          values,
          config
        };
      }
    });

    return probabilities;
  };

  // Compute percentile-based thresholds from historical data
  const computeAutoThresholds = (data) => {
    const series = {
      temperature: data.map(d => Number(d.temperature)).filter(isFinite),
      humidity: data.map(d => Number(d.humidity)).filter(isFinite),
      precipitation: data.map(d => Number(d.precipitation)).filter(isFinite),
      windSpeed: data.map(d => Number(d.windSpeed)).filter(isFinite)
    };
    const pct = (arr, p) => {
      if (!arr || arr.length === 0) return undefined;
      const a = [...arr].sort((a,b)=>a-b);
      const idx = Math.floor((p/100) * (a.length-1));
      return a[idx];
    };
    return {
      temperature: pct(series.temperature, 80),
      humidity: pct(series.humidity, 70),
      precipitation: pct(series.precipitation, 80),
      windSpeed: pct(series.windSpeed, 80)
    };
  };

  // Filter dataset to seasonal window around selected Day-of-Year
  const getDatasetForStats = (data) => {
    if (!useSeasonalWindow || !selectedDate) return data;
    const target = Number(selectedDate);
    const inWindow = (doy) => {
      const diff = Math.abs(doy - target);
      return diff <= seasonalWindowDays || (365 - diff) <= seasonalWindowDays; // wrap year
    };
    return data.filter(d => {
      if (!d.dateFormatted) return true;
      const date = new Date(d.dateFormatted + 'T00:00:00Z');
      const doy = Math.floor((date - new Date(date.getUTCFullYear(), 0, 0)) / (1000*60*60*24));
      return inWindow(doy);
    });
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 70) return "text-red-600 bg-red-50";
    if (probability >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getProbabilityText = (probability) => {
    if (probability >= 70) return "High Risk";
    if (probability >= 40) return "Moderate Risk";
    return "Low Risk";
  };

  // Qualitative condition tags based on analyzed stats
  const getConditionTags = () => {
    if (!probabilityData) return [];
    const tags = [];

    const temp = probabilityData.temperature;
    const hum = probabilityData.humidity;
    const precip = probabilityData.precipitation;
    const wind = probabilityData.windSpeed;

    // Very hot / very cold
    if (temp && temp.mean >= Number(thresholds.temperature)) tags.push("very hot");
    if (temp && temp.mean <= 10) tags.push("very cold");

    // Very windy (loosen to >=40% exceedance)
    if (wind && (wind.exceedanceProbability >= 40 || wind.mean >= Number(thresholds.windSpeed))) tags.push("very windy");

    // Very wet (loosen to >=40% exceedance)
    if (precip && (precip.exceedanceProbability >= 40 || precip.mean >= Number(thresholds.precipitation))) tags.push("very wet");

    // Very uncomfortable via simple Heat Index (F)
    if (temp && hum) {
      const tC = temp.mean;
      const rh = hum.mean;
      const tF = tC * 9/5 + 32;
      // Rothfusz regression (approx for typical T/RH ranges)
      const HI = -42.379 + 2.04901523*tF + 10.14333127*rh - 0.22475541*tF*rh - 0.00683783*tF*tF - 0.05481717*rh*rh + 0.00122874*tF*tF*rh + 0.00085282*tF*rh*rh - 0.00000199*tF*tF*rh*rh;
      if (HI >= 100) tags.push("very uncomfortable");
    }

    return tags;
  };

  const getTagClass = (tag) => {
    switch (tag) {
      case 'very hot':
        return 'bg-red-600 text-white';
      case 'very cold':
        return 'bg-blue-600 text-white';
      case 'very windy':
        return 'bg-purple-600 text-white';
      case 'very wet':
        return 'bg-blue-50 text-blue-600';
      case 'very uncomfortable':
        return 'bg-orange-600 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        🌍 NASA Earth Data Weather Dashboard
      </h1>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Location & Time Selection</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City Name
            </label>
            <input
              type="text"
              placeholder="Enter city name (e.g., Pune, Mumbai)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day of Year (1-365)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              placeholder="Day of year"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude (Optional)
            </label>
            <input
              type="number"
              step="0.0001"
              placeholder="18.5204"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude (Optional)
            </label>
            <input
              type="number"
              step="0.0001"
              placeholder="73.8567"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={fetchWeatherAnalysis}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing Weather Data..." : "Analyze Weather Conditions"}
        </button>
      </div>

      {/* Weather Variables Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Select Weather Variables</h2>
          <label className="flex items-center text-sm space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useAutoThresholds}
              onChange={(e) => setUseAutoThresholds(e.target.checked)}
            />
            <span>Auto thresholds (percentile-based)</span>
          </label>
        </div>
        <div className="flex items-center text-sm mb-4 space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useSeasonalWindow}
              onChange={(e) => setUseSeasonalWindow(e.target.checked)}
            />
            <span>Seasonal window (±{seasonalWindowDays} days around selected day)</span>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {weatherVariables.map(variable => (
            <div key={variable.id} className="border rounded-md p-3">
              <label className="flex items-center space-x-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={selectedVariables.includes(variable.id)}
                  onChange={() => handleVariableToggle(variable.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">
                  {variable.name} ({variable.unit})
                </span>
              </label>
              {useAutoThresholds ? (
                <div className="text-xs text-gray-600">
                  Auto threshold: {autoThresholdValues[variable.id] != null ? autoThresholdValues[variable.id].toFixed(1) : '—'} {variable.unit}
                </div>
              ) : (
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 mr-2">Threshold:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={thresholds[variable.id]}
                    onChange={(e) => setThresholds(t => ({ ...t, [variable.id]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {weatherData && (
        <div className="space-y-6">
          {/* Current Weather */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Current Weather Conditions</h2>
            <WeatherCard data={weatherData} />
          </div>

          {/* Probability Analysis */}
          {probabilityData && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Weather Probability Analysis</h2>
              {/* Condition Summary */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Condition Summary:</div>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const tags = getConditionTags();
                    if (tags.length === 0) {
                      return (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
                          no extreme conditions detected
                        </span>
                      );
                    }
                    return tags.map((tag) => (
                      <span key={tag} className={`px-2 py-1 rounded-full text-xs ${getTagClass(tag)}`}>
                        {tag}
                      </span>
                    ));
                  })()}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(probabilityData).map(([variable, data]) => (
                  <div key={variable} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">{data.config.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Mean Value:</span>
                        <span className="font-medium">{data.mean.toFixed(1)} {data.config.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Threshold:</span>
                        <span className="font-medium">{data.threshold} {data.config.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exceedance Probability:</span>
                        <span className={`font-medium px-2 py-1 rounded ${getProbabilityColor(data.exceedanceProbability)}`}>
                          {data.exceedanceProbability.toFixed(1)}% ({getProbabilityText(data.exceedanceProbability)})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Visual probability bars */}
              <div className="mt-6">
                <ProbabilityChart probabilityData={probabilityData} />
              </div>
            </div>
          )}

          {/* Data Download */}
          {historicalData.length > 0 && (
            <DataDownload 
              data={historicalData} 
              location={location || `${latitude}, ${longitude}`}
              variables={selectedVariables}
            />
          )}
        </div>
      )}
    </div>
  );
}
