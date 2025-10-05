import React, { useState } from "react";
import API from "../api";
import WeatherCard from "../components/WeatherCard";

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!city.trim()) return;
    
    setLoading(true);
    try {
      const res = await API.get(`/weather?city=${city}`);
      setWeather(res.data);
    } catch (error) {
      console.error("Error fetching weather:", error);
      alert("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl mb-4">Check Your Weather ☀️</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border px-3 py-2 rounded-md mr-3"
          onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
        />
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Get Weather"}
        </button>
      </div>

      <div className="mt-6">
        <WeatherCard data={weather} />
      </div>
    </div>
  );
}
